const asyncHandler = require("express-async-handler");
const ContentHistory = require("../models/ContentHistory");
const User = require("../models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiAIController = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  console.log("Received prompt:", prompt);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    console.log("Generated content:", content);

    let newContent = null;

    // Save to content history if user is logged in
    if (req.user && req.user._id) {
      newContent = await ContentHistory.create({
        user: req.user._id,
        content,
      });

      const userFound = await User.findById(req.user.id);
      if (userFound) {
        userFound.contentHistory.push(newContent._id);
        userFound.apiRequestCount += 1;
        await userFound.save();
      }
    }

    res.status(200).json(content);
  } catch (error) {
    console.error("Gemini generation error:", error);
    res.status(500).json({ message: "Gemini generation failed" });
  }
});

module.exports = {
  geminiAIController,
};