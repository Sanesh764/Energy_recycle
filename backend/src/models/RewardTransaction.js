const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['EARN', 'REDEEM'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    deviceCode: {
      type: String
    },
    description: {
      type: String,
      required: true
    },
    couponCode: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RewardTransaction', rewardTransactionSchema);
