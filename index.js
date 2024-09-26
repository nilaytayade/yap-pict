const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
const cors = require("cors");

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://nilay:saymyname@thanathaya.gvkqicv.mongodb.net/?retryWrites=true&w=majority&appName=thanathaya"
);

// Create a schema and model for the messages
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  datetime: String,
});

const Message = mongoose.model("Message", messageSchema);

// Utility function to generate anonymous username
function generateAnonymousUsername() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const emojis = ["🕵️"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  return `Anonymous${randomNum}${randomEmoji}`;
}

// Utility function to get current time in Indian Standard Time format
function getCurrentISTTime() {
  d = new Date();
  utc = d.getTime() + d.getTimezoneOffset() * 60000;
  nd = new Date(utc + 3600000 * +5.5);
  var ist = nd.toLocaleString();
  console.log("IST now is : " + ist);
  return ist;
}

// Endpoint to get all messages sorted by newest first
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ datetime: -1 });
    res.json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages" });
  }
});

// Endpoint to add a new message
app.post("/messages", async (req, res) => {
  try {
    const { message } = req.body;
    const username = generateAnonymousUsername();
    const datetime = getCurrentISTTime();

    const newMessage = new Message({ username, message, datetime });
    await newMessage.save();

    res.status(201).json({ message: "Message added successfully", newMessage });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while adding the message" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
