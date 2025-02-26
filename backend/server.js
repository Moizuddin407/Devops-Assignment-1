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
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo-container:27017/mydatabase"; // Ensure mongo container name

const connectWithRetry = () => {
  console.log("🔄 Trying to connect to MongoDB...");
  mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => {
      console.error("❌ MongoDB Connection Failed. Retrying in 5 seconds...", err);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();  // Keep retrying until MongoDB is ready

// Sample Schema
const messageSchema = new mongoose.Schema({ text: String });
const Message = mongoose.model('Message', messageSchema);

// API Route
app.get('/messages', async (req, res) => {
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
