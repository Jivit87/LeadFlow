const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  score: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'New', // New, Engaged, Qualified, Customer
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for leaderboard efficiency
LeadSchema.index({ score: -1 });

module.exports = mongoose.model('Lead', LeadSchema);
