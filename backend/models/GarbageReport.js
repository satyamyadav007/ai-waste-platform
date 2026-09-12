const mongoose = require("mongoose");

const garbageReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },

    userEmail: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    originalImageData: {
      type: String,
      default: "",
    },

    garbageType: {
      type: String,
      default: "Other",
    },

    description: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "Pending",
    },

    aiResult: {
      garbageDetected: {
        type: Boolean,
        default: false,
      },

      garbageType: {
        type: String,
        default: "",
      },

      confidence: {
        type: Number,
        default: 0,
      },

      severity: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },
    },

    duplicateCheck: {
      duplicateDetected: {
        type: Boolean,
        default: false,
      },

      confidence: {
        type: Number,
        default: 0,
      },

      reason: {
        type: String,
        default: "",
      },
    },

    proofImage: {
      type: String,
      default: "",
    },

    verification: {
      garbageRemoved: {
        type: Boolean,
        default: false,
      },

      confidence: {
        type: Number,
        default: 0,
      },

      explanation: {
        type: String,
        default: "",
      },
    },

    rating: {
      type: Number,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "garbageReports",
  }
);

module.exports = mongoose.model(
  "GarbageReport",
  garbageReportSchema
);