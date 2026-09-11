const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json({ limit: "50mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


// --------------------------------------------------
// GEMINI AI RETRY FUNCTION
// --------------------------------------------------

async function generateAIContent(request, retries = 3) {
  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {
    try {
      return await ai.models.generateContent(
        request
      );

    } catch (error) {
      console.error(
        `AI attempt ${attempt} failed:`,
        error.message
      );

      // --------------------------------------------------
      // QUOTA ERROR
      // Do NOT retry 429 errors.
      // --------------------------------------------------

      if (error.status === 429) {
        console.error(
          "Gemini API quota has been exceeded."
        );

        throw error;
      }

      // --------------------------------------------------
      // OTHER NON-RETRYABLE ERRORS
      // --------------------------------------------------

      if (error.status !== 503) {
        throw error;
      }

      // --------------------------------------------------
      // RETRY ONLY 503 ERRORS
      // --------------------------------------------------

      if (attempt === retries) {
        throw error;
      }

      const waitTime =
        attempt * 3000;

      console.log(
        `Gemini is temporarily unavailable. Retrying in ${
          waitTime / 1000
        } seconds...`
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            waitTime
          )
      );
    }
  }
}


// --------------------------------------------------
// HOME / SERVER TEST
// --------------------------------------------------

app.get("/", (req, res) => {
  res.send(
    "CleanBharat AI backend is running."
  );
});


// --------------------------------------------------
// AI GARBAGE DETECTION
// --------------------------------------------------

app.post(
  "/api/analyze-garbage",
  async (req, res) => {
    try {
      const {
        image,
        mimeType,
      } = req.body;

      if (
        !image ||
        !mimeType
      ) {
        return res.status(400).json({
          message:
            "Image and mimeType are required.",
        });
      }

      console.log(
        "Received image for AI analysis."
      );

      const response =
        await generateAIContent({
          model:
            "gemini-3.6-flash",

          contents: [
            {
              role: "user",

              parts: [
                {
                  inlineData: {
                    mimeType:
                      mimeType,

                    data:
                      image,
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
            responseMimeType:
              "application/json",

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

      const text =
        response.text;

      console.log(
        "AI Response:"
      );

      console.log(text);

      const result =
        JSON.parse(text);

      console.log(
        "Sending AI result to frontend."
      );

      res.json(result);

    } catch (error) {
      console.error(
        "AI Error:",
        error
      );

      if (error.status === 429) {
        return res.status(429).json({
          message:
            "Gemini AI daily quota has been exceeded. Please try again later.",
        });
      }

      res.status(500).json({
        message:
          "Failed to analyze image.",
        error:
          error.message,
      });
    }
  }
);


// --------------------------------------------------
// AI BEFORE VS AFTER VERIFICATION
// --------------------------------------------------

app.post(
  "/api/verify-collection",
  async (req, res) => {
    try {
      const {
        beforeImage,
        beforeMimeType,
        afterImage,
        afterMimeType,
      } = req.body;

      if (
        !beforeImage ||
        !beforeMimeType ||
        !afterImage ||
        !afterMimeType
      ) {
        return res.status(400).json({
          message:
            "Before and after images are required.",
        });
      }

      console.log(
        "Received before/after images for verification."
      );

      const response =
        await generateAIContent({
          model:
            "gemini-3.6-flash",

          contents: [
            {
              role: "user",

              parts: [
                {
                  inlineData: {
                    mimeType:
                      beforeMimeType,

                    data:
                      beforeImage,
                  },
                },

                {
                  inlineData: {
                    mimeType:
                      afterMimeType,

                    data:
                      afterImage,
                  },
                },

                {
                  text: `
You are verifying a garbage collection report.

The FIRST image is the BEFORE image.
The SECOND image is the AFTER image.

Compare both images carefully.

Determine whether the reported garbage appears to have
been substantially removed after collection.

Do not assume that a different camera angle automatically
means the garbage was removed.

Focus on visible garbage, waste piles, bins,
and the surrounding area.

Return JSON with:
- garbageRemoved: true or false
- confidence: number from 0 to 100
- explanation: short explanation
`,
                },
              ],
            },
          ],

          config: {
            responseMimeType:
              "application/json",

            responseSchema: {
              type: "object",

              properties: {
                garbageRemoved: {
                  type: "boolean",
                },

                confidence: {
                  type: "integer",
                },

                explanation: {
                  type: "string",
                },
              },

              required: [
                "garbageRemoved",
                "confidence",
                "explanation",
              ],
            },
          },
        });

      const text =
        response.text;

      console.log(
        "AI Verification Response:"
      );

      console.log(text);

      const result =
        JSON.parse(text);

      console.log(
        "Sending verification result to frontend."
      );

      res.json(result);

    } catch (error) {
      console.error(
        "Verification AI Error:",
        error
      );

      if (error.status === 429) {
        return res.status(429).json({
          message:
            "Gemini AI daily quota has been exceeded. Please try again later.",
        });
      }

      res.status(500).json({
        message:
          "Failed to verify garbage collection.",
        error:
          error.message,
      });
    }
  }
);


// --------------------------------------------------
// AI DUPLICATE COMPLAINT DETECTION
// --------------------------------------------------

app.post(
  "/api/check-duplicate",
  async (req, res) => {
    try {
      const {
        currentImage,
        currentMimeType,
        existingReports,
      } = req.body;

      if (
        !currentImage ||
        !currentMimeType
      ) {
        return res.status(400).json({
          message:
            "Current report image is required.",
        });
      }

      if (
        !existingReports ||
        existingReports.length === 0
      ) {
        return res.json({
          duplicateDetected:
            false,

          confidence:
            100,

          reason:
            "No nearby previous reports were found.",
        });
      }

      console.log(
        "Checking for duplicate complaints."
      );

      const parts = [
        {
          inlineData: {
            mimeType:
              currentMimeType,

            data:
              currentImage,
          },
        },

        {
          text: `
The first image is the NEW garbage report.

The following images belong to PREVIOUS nearby garbage reports.

Determine whether the NEW report appears to show the
same garbage incident as one of the previous reports.

Consider:

- visible garbage pile
- overflowing bin
- surrounding scene
- objects and layout
- type of garbage
- location information

A report should be considered a duplicate only when there
is reasonable evidence that it refers to the same garbage problem.

Do not mark reports as duplicates only because they contain
the same general type of garbage.

Previous report information:
`,
        },
      ];

      for (
        const report of existingReports
      ) {
        parts.push({
          text: `
Previous Report ID:
${report.id}

Distance from new report:
${report.distanceMeters} meters

Garbage Type:
${report.garbageType}

Description:
${report.description}
`,
        });

        if (
          report.image &&
          report.mimeType
        ) {
          parts.push({
            inlineData: {
              mimeType:
                report.mimeType,

              data:
                report.image,
            },
          });
        }
      }

      parts.push({
        text: `
Return JSON according to the provided schema.
`,
      });

      const response =
        await generateAIContent({
          model:
            "gemini-3.6-flash",

          contents: [
            {
              role: "user",

              parts:
                parts,
            },
          ],

          config: {
            responseMimeType:
              "application/json",

            responseSchema: {
              type: "object",

              properties: {
                duplicateDetected: {
                  type: "boolean",
                },

                confidence: {
                  type: "integer",
                },

                reason: {
                  type: "string",
                },
              },

              required: [
                "duplicateDetected",
                "confidence",
                "reason",
              ],
            },
          },
        });

      const text =
        response.text;

      console.log(
        "Duplicate AI Response:"
      );

      console.log(text);

      const result =
        JSON.parse(text);

      res.json(result);

    } catch (error) {
      console.error(
        "Duplicate AI Error:",
        error
      );

      if (error.status === 429) {
        return res.status(429).json({
          message:
            "Gemini AI daily quota has been exceeded. Please try again later.",
        });
      }

      res.status(500).json({
        message:
          "Failed to check duplicate complaint.",
        error:
          error.message,
      });
    }
  }
);


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `CleanBharat AI backend running on port ${PORT}`
  );
});