const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
const corsOptions = {
  origin: '*', // Allow any origin (For development only!)
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;
// NOTE: The MONGO_URI will now come from the Kubernetes environment variable set by the Secret.
// The fallback here is less relevant in K8s but kept for standalone potential.
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo-container:27017/mydatabase";

const connectWithRetry = () => {
  // Add check if MONGO_URI is actually set
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI environment variable not set! Cannot connect.");
    // Optionally retry later or exit, depending on desired behavior
    // setTimeout(connectWithRetry, 5000);
    return;
  }
  console.log("🔄 Trying to connect to MongoDB using URI:", MONGO_URI); // Log the URI being used
  mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => {
      console.error("❌ MongoDB Connection Failed. Retrying in 5 seconds...", err.message); // Log only error message
      setTimeout(connectWithRetry, 5000);
    });
};

// Start connection attempts
connectWithRetry();

// Sample Schema
const messageSchema = new mongoose.Schema({ text: String });
const Message = mongoose.model('Message', messageSchema);

// --- NEW HEALTH CHECK ENDPOINT ---
app.get('/health', (req, res) => {
  // Check database connection status
  // readyState values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  if (isDbConnected) {
    res.status(200).json({ status: 'UP', database: 'connected' });
  } else {
    // Return 503 Service Unavailable if DB is not connected
    console.warn(`⚠️ Health check failed: Database not connected (readyState: ${dbState})`);
    res.status(503).json({ status: 'DOWN', database: 'disconnected or connecting' });
  }
});
// --- END OF HEALTH CHECK ENDPOINT ---

// API Route
app.get('/messages', async (req, res) => {
  // Check DB connection before proceeding
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database not available" });
  }
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// API Route to post a message
app.post('/messages', async (req, res) => {
  // Check DB connection before proceeding
  if (mongoose.connection.readyState !== 1) {
     return res.status(503).json({ error: "Database not available" });
  }
  try {
    const { message } = req.body;
    const newMessage = new Message({ text: message });
    await newMessage.save();
    res.status(200).json({ message: 'Message saved' });
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ error: "Error saving message" });
  }
});
// Start the server
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Backend running on port ${PORT}`));
