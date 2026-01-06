const ScoringRule = require('../models/ScoringRule');

// Get all configured scoring rules.
const getRules = async (req, res) => {
  try {
    const rules = await ScoringRule.find();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update or create a scoring rule for a specific event type.
const updateRule = async (req, res) => {
  try {
    const { points, isActive } = req.body;
    
    // Upsert: update if exists, create if not
    const rule = await ScoringRule.findOneAndUpdate(
        { event_type: req.params.type },
        { points, isActive },
        { new: true, upsert: true } 
    );
    
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRules,
  updateRule
};
