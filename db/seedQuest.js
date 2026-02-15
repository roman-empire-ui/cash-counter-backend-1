import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../models/aiModel.js";

dotenv.config();

const questions = [
    {
        text: "Any Myntra, Meesho, or Flipkart expenses today?",
        category: "Shopping",
        priority: 1,
      },

    

     
  // WATER
  {
    text: "Did you pay for water today?",
    category: "WATER",
    priority: 2,
  },

  // ELECTRICITY
  {
    text: "Any electricity-related expense today?",
    category: "ELECTRICITY",
    priority: 9,
  },

  // COURIER
  {
    text: "Any Zepto, Instamart, BlinkIt Charges today?",
    category: "COURIER",
    priority: 3,
  },



 

  // STAFF
  {
    text: "Did you give salary or advance to staff today?",
    category: "STAFF",
    priority: 4,
  },

  // RENT
  {
    text: "Any shop rent payment today?",
    category: "RENT",
    priority: 5,
  },

  // INTERNET
  {
    text: "Any internet or phone recharge expense today?",
    category: "INTERNET",
    priority: 6,
  },

  // PERSONAL
  {
    text: "Did you spend personal money from business cash?",
    category: "PERSONAL",
    priority: 7,
  },

  // OTHER
  {
    text: "Any other expense not yet recorded?",
    category: "OTHER",
    priority: 8,
  },
];

  const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const q of questions) {
      await Question.updateOne(
        { text: q.text },
        { $setOnInsert: q },
        { upsert: true }
      );
    }

    console.log("✅ Questions seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

export default seedQuestions;
