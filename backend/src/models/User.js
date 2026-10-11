const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      select: false
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
    },
    rewardCoins: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

/**
 * Compares candidate password against stored bcrypt hash.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Unique index on cognitoSub is created via field definition above
module.exports = mongoose.model('User', userSchema);
