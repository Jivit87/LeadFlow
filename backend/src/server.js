require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const eventController = require('./controllers/eventController');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ["https://leadflow-0m21.onrender.com", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Socket.IO for real-time capabilities
const io = new Server(server, {
  cors: {
    origin: ["https://leadflow-0m21.onrender.com", "http://localhost:5173"], 
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Inject IO into request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/', (req, res) => {
  res.send('LeadFlow API is running');
});

// Routes
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/rules', require('./routes/ruleRoutes'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Inject io into controller for notifications AFTER DB is connected
    eventController.setScoringService(io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  }
};

startServer();
