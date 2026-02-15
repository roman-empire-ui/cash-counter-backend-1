import LossSession from "../models/lossLearnModel.js";
import Question from "../models/aiModel.js";

/**
 * Get or create today's loss session
 */
export const getTodayLossSession = async (req, res) => {
  try {
    const { date } = req.query;

    const sessionDate = new Date(date);
    sessionDate.setUTCHours(0, 0, 0, 0);

    const session = await LossSession.findOne({ date: sessionDate });

    if (!session) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      sessionId: session._id,
      lossAmount: session.lossAmount,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal error" });
  }
};

/**
 * Get next AI question
 */
export const getNextQuestion = async (req, res) => {
  const { sessionId } = req.params;

  const session = await LossSession.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Get unanswered questions
  const askedIds = session.askedQuestions.map(q => q.questionId.toString());

  const nextQuestion = await Question.findOne({
    _id: { $nin: askedIds }
  });

  // ❌ DO NOT auto-resolve here
  if (!nextQuestion) {
    return res.json({ done: true });
  }

  return res.json({
    done: false,
    question: nextQuestion,
  });
};


/**
 * Answer AI question
 */
export const answerQuestion = async (req, res) => {
  const { sessionId } = req.params;
  const { questionId, answer } = req.body;

  const session = await LossSession.findById(sessionId);
  const question = await Question.findById(questionId);

  if (!session || !question) {
    return res.status(404).json({ message: "Not found" });
  }

  session.askedQuestions.push({
    questionId,
    answer,
  });

  // ✅ ONLY HERE resolve the session
  if (answer === "YES") {
    session.resolved = true;
    session.resolvedBy = question.reason || "IDENTIFIED";
  }

  await session.save();

  return res.json({ success: true });
};

