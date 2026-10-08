const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    address: {
      text: {
        type: String,
        required: true,
        trim: true
      },
      pincode: {
        type: String,
        required: true,
        trim: true
      }
    },
    preferredSlot: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ACCEPTED', 'COLLECTED', 'CANCELLED'],
      default: 'REQUESTED',
      required: true
    },
    collectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Indexes defined in SPEC.md
pickupSchema.index({ status: 1, 'address.pincode': 1 });
pickupSchema.index({ collectorId: 1, status: 1 });

module.exports = mongoose.model('Pickup', pickupSchema);
