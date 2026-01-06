const Lead = require('../models/Lead');
const Event = require('../models/Event');
const ScoringRule = require('../models/ScoringRule');
const ScoreHistory = require('../models/ScoreHistory');

// Service to handle event ingestion, idempotency, and score calculation.
class ScoringService {
  constructor(io) {
    this.io = io;
  }

  async initRules() {
    const defaultRules = [
      { event_type: 'email_open', points: 10 },
      { event_type: 'page_view', points: 5 },
      { event_type: 'form_submission', points: 20 },
      { event_type: 'demo_request', points: 50 },
      { event_type: 'purchase', points: 100 }
    ];

    for (const rule of defaultRules) {
      const exists = await ScoringRule.findOne({ event_type: rule.event_type });
      if (!exists) {
        await ScoringRule.create(rule);
        console.log(`Created default rule: ${rule.event_type}`);
      }
    }
  }

  // Process a single event: check exists -> save -> recalculate score.
  async processEvent(eventData) {
    const { eventId, leadId, type, metadata, timestamp } = eventData;

    const existingEvent = await Event.findOne({ eventId });
    if (existingEvent) {
      console.log(`Event ${eventId} already processed. Skipping.`);
      return { status: 'skipped', message: 'Duplicate event' };
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }

    const newEvent = new Event({
      eventId,
      leadId,
      type,
      metadata,
      timestamp: new Date(timestamp),
      processed: false 
    });
    await newEvent.save();

    await this.recalculateLeadScore(leadId);

    newEvent.processed = true;
    await newEvent.save();

    return { status: 'processed', eventId };
  }

  //  Replays all events for a lead to determine the current score.
  async recalculateLeadScore(leadId) {
    const lead = await Lead.findById(leadId);
    
    const events = await Event.find({ leadId }).sort({ timestamp: 1 });
    const rules = await ScoringRule.find({ isActive: true });
    
    const ruleMap = {};
    rules.forEach(r => ruleMap[r.event_type] = r.points);

    let newScore = 0;
    
    for (const event of events) {
      const points = ruleMap[event.type] || 0;
      newScore += points;
    }

    if (lead.score !== newScore) {
       const scoreChange = newScore - lead.score;
       
       await ScoreHistory.create({
         leadId,
         scoreChange,
         newScore,
         reason: `Recalculation triggered by event processing`,
         eventId: 'recalc' 
       });

       lead.score = newScore;
       await lead.save();

       if (this.io) {
         this.io.emit('score_update', { leadId, newScore, scoreChange });
       }
    }
    
    return newScore;
  }
}

module.exports = ScoringService;
