const ScoringService = require('../services/scoringService');
const Event = require('../models/Event');
const { v4: uuidv4 } = require('uuid'); 
const csv = require('csv-parser'); 
const fs = require('fs');

let scoringService;

// Initialize the scoring service with Socket.IO for real-time updates
const setScoringService = (io) => {
    scoringService = new ScoringService(io);
    scoringService.initRules();
};

// Handle incoming event requests.

//Checks for required fields, generates metadata, and delegates processing.
const ingestEvent = async (req, res) => {
  try {
    const { leadId, type, metadata, timestamp, eventId } = req.body;

    if (!leadId || !type) {
        return res.status(400).json({ message: 'Missing required fields: leadId and type are mandatory.' });
    }

    const eventData = {
        eventId: eventId || uuidv4(),
        leadId,
        type,
        metadata,
        timestamp: timestamp || new Date().toISOString()
    };

    const result = await scoringService.processEvent(eventData);
    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Retrieve events, optionally filtered by leadId.
const getEvents = async (req, res) => {
    try {
        const query = req.query.leadId ? { leadId: req.query.leadId } : {};
        const events = await Event.find(query).sort({ timestamp: -1 }).limit(100);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Process a CSV file upload containing batch events.
const batchUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    let processedCount = 0;

    try {
        // Stream the file to handle large datasets efficiently
        const stream = fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                // Cleanup temp file
                fs.unlinkSync(req.file.path);

                for (const row of results) {
                    try {
                         if (!row.leadId || !row.type) {
                             errors.push({ row, error: 'Missing leadId or type' });
                             continue;
                         }

                         const eventData = {
                             eventId: uuidv4(),
                             leadId: row.leadId,
                             type: row.type,
                             metadata: { source: 'batch_upload' },
                             timestamp: row.timestamp || new Date().toISOString()
                         };

                         await scoringService.processEvent(eventData);
                         processedCount++;
                    } catch (err) {
                        errors.push({ row, error: err.message });
                    }
                }

                res.json({ 
                    message: 'Batch processing complete', 
                    total: results.length, 
                    processed: processedCount, 
                    errors 
                });
            });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  setScoringService,
  ingestEvent,
  getEvents,
  batchUpload
};
