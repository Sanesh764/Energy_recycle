const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    seq: {
      type: Number,
      default: 0,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Counter', counterSchema);
