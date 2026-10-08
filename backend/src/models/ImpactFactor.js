const mongoose = require('mongoose');

const impactFactorSchema = new mongoose.Schema(
  {
    deviceType: {
      type: String,
      enum: ['PHONE', 'LAPTOP', 'TV', 'CHARGER', 'BATTERY', 'PRINTER', 'OTHER'],
      required: true,
      unique: true
    },
    avgWeightKg: {
      type: Number,
      min: 0
    },
    recyclableShare: {
      type: Number,
      min: 0,
      max: 1
    },
    source: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Unique index on deviceType is created via field definition above
module.exports = mongoose.model('ImpactFactor', impactFactorSchema, 'impact_factors');
