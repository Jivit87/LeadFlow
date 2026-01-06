# LeadFlow - Event-Driven Lead Scoring System

## Project Overview
**LeadFlow** is a real-time, event-driven application designed to evaluate and rank sales leads based on their interactions. Unlike traditional scoring systems that simply update a counter, LeadFlow ingests a stream of raw events (e.g., "Email Opened", "Page Viewed") and dynamically calculates scores based on configurable rules.

This project was built to demonstrate an **Event-Driven Architecture** that ensures specific properties like **Idempotency** (preventing duplicate processing) and **Ordering** (ensuring scores reflect the correct sequence of actions).

---

## Key Features

### 1. Real-Time Scoring & Dashboard
- **Instant Updates**: The frontend connects via `Socket.IO`. As soon as an event is processed by the backend, the dashboard updates immediately—no refresh needed.
- **Leaderboard**: Visual ranking of top leads by score.
- **Live Notifications**: Visual cues when scores change.

### 2. Robust Event Processing
- **Idempotency**: Every event has a unique `eventId`. If the same event is sent twice (e.g., due to network retries), the system detects the duplicate and skips processing it, ensuring the score remains accurate.
- **Ordering & Replay**: The system calculates scores by replaying the history of valid events. This ensures that even if rules change later (e.g., "Page View" goes from 5 to 10 points), we can recalculate accurate scores for all leads based on their actual history.

### 3. Flexible Configuration
- **Dynamic Rules**: Scoring rules are not hardcoded. You can configure them via the **Settings** page (e.g., change 'Purchase' from 100 to 200 points) and they take effect immediately for new calculations.

### 4. Data Ingestion
- **Simulate Events**: A built-in simulator to create leads and trigger manual events.
- **Batch Upload**: Support for uploading CSV files to ingest bulk events at once.

---

## Architecture

The project is built using the **MERN Stack** with specialized components for the event-driven nature:

- **Backend**: Node.js + Express
  - **Scoring Service**: The core logic engine. It handles the "Write" path—validating events, checking for duplicates, and calculating scores.
  - **Socket.IO**: The push mechanism for the "Read" path, keeping the UI in sync.
- **Database**: MongoDB
  - `Leads`: Stores current state (Snapshot).
  - `Events`: The immutable ledger of all actions (Source of Truth).
  - `Rules`: Configurable scoring logic.
  - `ScoreHistory`: Audit trail of every score change.
- **Frontend**: React + Tailwind CSS
  - **Vite**: For fast development and build.
  - **Recharts**: For visualizing score trends.

---

## Implementation Details

### How Idempotency is Handled
We enforce uniqueness on the `eventId` field in the MongoDB `Event` schema.
```javascript
// backend/src/models/Event.js
eventId: { type: String, required: true, unique: true }
```
When an event arrives, we check if it exists. If caught by the unique index or our pre-check, it is discarded safely.

### How Scoring Works
Instead of just `score = score + points`, we use a more robust approach in `ScoringService`:
1. **Ingest**: Save the raw event.
2. **Process**: Fetch all applicable events for the lead.
3. **Calculate**: Re-sum the score based on *current* active rules.
4. **Update**: Save the new score and emit a socket event if it changed.
This "Event Sourcing" style approach allows for powerful features like recalculating history if rules change.

---

## How to Run

### Prerequisites
- Node.js installed
- MongoDB running locally (default: `mongodb://localhost:27017`)

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env file
echo "PORT=5000" > .env
echo "MONGO_URI=mongodb://localhost:27017/leadflow" >> .env
# Run
npm run dev
```
*Server runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*App runs on `http://localhost:3000`*

---

## Verification Walkthrough

1. Open `http://localhost:3000`.
2. Go to **Simulate Events** (/simulate).
3. **Create a Lead** (e.g., "Alice").
4. **Send an Event**: Select Alice, choose "Page View", click Send.
5. Check **Dashboard**: Alice's score should be 5.
6. **Batch Upload**: Upload a CSV with `leadId, type` columns to test bulk processing.

