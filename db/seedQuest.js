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

      {
        text: "Have you Paid Milk bill?",
        category: "Shopping",
        priority: 2,
      },

     
  // WATER
  {
    text: "Did you pay for water today?",
    category: "WATER",
    priority: 3,
  },

  // ELECTRICITY
  {
    text: "Any electricity-related expense today?",
    category: "ELECTRICITY",
    priority: 10,
  },

  // COURIER
  {
    text: "Any Zepto, Instamart, BlinkIt Charges today?",
    category: "COURIER",
    priority: 4,
  },



 

  // STAFF
  {
    text: "Did you give salary or advance to staff today?",
    category: "STAFF",
    priority: 5,
  },

  // RENT
  {
    text: "Any shop rent payment today?",
    category: "RENT",
    priority: 6,
  },

  // INTERNET
  {
    text: "Any internet or phone recharge expense today?",
    category: "INTERNET",
    priority: 7,
  },

  // PERSONAL
  {
    text: "Did you spend personal money from business cash?",
    category: "PERSONAL",
    priority: 8,
  },

  // OTHER
  {
    text: "Any other expense not yet recorded?",
    category: "OTHER",
    priority: 9,
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
