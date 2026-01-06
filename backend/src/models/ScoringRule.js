const mongoose = require('mongoose');

const ScoringRuleSchema = new mongoose.Schema({
  event_type: {
    type: String,
    required: true,
    unique: true
  },
  points: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('ScoringRule', ScoringRuleSchema);
