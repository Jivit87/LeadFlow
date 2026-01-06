const mongoose = require('mongoose');

const ScoreHistorySchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  scoreChange: {
    type: Number,
    required: true
  },
  newScore: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  eventId: {
      type: String // Optional link to the event that caused this
  }
});

ScoreHistorySchema.index({ leadId: 1, timestamp: -1 });

module.exports = mongoose.model('ScoreHistory', ScoreHistorySchema);
