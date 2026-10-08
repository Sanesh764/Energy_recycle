const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    cognitoSub: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['citizen', 'collector', 'admin'],
      default: 'citizen',
      required: true
    },
    phone: {
      type: String,
      trim: true
    },
    servicePincodes: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Unique index on cognitoSub is created via field definition above
module.exports = mongoose.model('User', userSchema);
