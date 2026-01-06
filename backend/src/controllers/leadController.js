const Lead = require('../models/Lead');
const ScoreHistory = require('../models/ScoreHistory');

// Fetch all leads, sorted by score (Descending).
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ score: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch a single lead by ID.
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register a new lead.
const createLead = async (req, res) => {
  try {
    const { name, email } = req.body;
    const lead = await Lead.create({ name, email });
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get the score history for a specific lead.
const getLeadHistory = async (req, res) => {
    try {
        const history = await ScoreHistory.find({ leadId: req.params.id }).sort({ timestamp: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  getLeads,
  getLead,
  createLead,
  getLeadHistory
};
