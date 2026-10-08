const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema(
  {
    step: {
      type: String,
      required: true,
      enum: [
        'REGISTERED',
        'PICKUP_REQUESTED',
        'ACCEPTED',
        'COLLECTED',
        'INSPECTED',
        'COMPLETED',
        'CANCELLED'
      ]
    },
    at: {
      type: Date,
      default: Date.now,
      required: true
    },
    byUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    byRole: {
      type: String,
      enum: ['citizen', 'collector', 'admin']
    },
    note: {
      type: String,
      trim: true
    }
  },
  {
    _id: false
  }
);

const aiSuggestionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['OK', 'FALLBACK'],
      required: true
    },
    suggestedOutcome: {
      type: String,
      enum: ['REPAIR', 'REUSE', 'RESALE', 'RECYCLE'],
      required: true
    },
    reason: {
      type: String,
      maxlength: 200,
      required: true
    },
    safetyTip: {
      type: String,
      maxlength: 150,
      required: true
    },
    modelId: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const deviceSchema = new mongoose.Schema(
  {
    deviceCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['PHONE', 'LAPTOP', 'TV', 'CHARGER', 'BATTERY', 'PRINTER', 'OTHER'],
      required: true
    },
    ageYears: {
      type: Number,
      min: 0,
      max: 30,
      required: true
    },
    powersOn: {
      type: Boolean,
      required: true
    },
    damage: {
      type: String,
      enum: ['NONE', 'MINOR', 'MAJOR'],
      required: true
    },
    notes: {
      type: String,
      maxlength: 300,
      default: ''
    },
    photoKey: {
      type: String,
      required: true
    },
    ai: {
      type: aiSuggestionSchema,
      required: true
    },
    finalOutcome: {
      type: String,
      enum: ['REPAIR', 'REUSE', 'RESALE', 'RECYCLE']
    },
    status: {
      type: String,
      enum: [
        'REGISTERED',
        'PICKUP_REQUESTED',
        'ACCEPTED',
        'COLLECTED',
        'INSPECTED',
        'COMPLETED',
        'CANCELLED'
      ],
      default: 'REGISTERED',
      required: true
    },
    timeline: {
      type: [timelineEventSchema],
      default: []
    },
    isSample: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes defined in SPEC.md
// Unique index on deviceCode is created via field definition above
deviceSchema.index({ ownerId: 1, createdAt: -1 });
deviceSchema.index({ status: 1 });

module.exports = mongoose.model('Device', deviceSchema);
