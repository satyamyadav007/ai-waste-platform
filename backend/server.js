const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("CleanBharat AI backend is running.");
});

app.post("/api/analyze-garbage", async (req, res) => {
  try {
    const { image, mimeType } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({
        message: "Image and mimeType are required.",
      });
    }

    console.log("Received image for AI analysis.");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: [
        {
          role: "user",

          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: image,
              },
            },

            {
              text: `
Analyze this image for a garbage reporting application.

Determine whether garbage is visible.

Classify the garbage type, estimate its severity,
give a confidence score, and provide a short description.
              `,
            },
          ],
        },
      ],

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            garbageDetected: {
              type: "boolean",
            },

            garbageType: {
              type: "string",

              enum: [
                "Household Waste",
                "Plastic Waste",
                "Construction Waste",
                "Organic Waste",
                "Mixed Waste",
                "Other",
                "No Garbage",
              ],
            },

            confidence: {
              type: "integer",
            },

            severity: {
              type: "string",

              enum: [
                "Low",
                "Medium",
                "High",
              ],
            },

            description: {
              type: "string",
            },
          },

          required: [
            "garbageDetected",
            "garbageType",
            "confidence",
            "severity",
            "description",
          ],
        },
      },
    });

    const text = response.text;

    console.log("AI Response:");
    console.log(text);

    const result = JSON.parse(text);

    console.log("Sending AI result to frontend.");

    res.json(result);
  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      message: "Failed to analyze image.",
      error: error.message,
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `CleanBharat AI backend running on port ${PORT}`
  );
});