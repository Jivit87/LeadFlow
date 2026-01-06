const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true // Idempotency key
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    required: true
  },
  processed: {
    type: Boolean,
    default: false
  },
  receivedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of unprocessed events
EventSchema.index({ leadId: 1, timestamp: 1 });

module.exports = mongoose.model('Event', EventSchema);
