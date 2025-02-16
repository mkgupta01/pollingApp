const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

require("dotenv").config();

mongoose.connect(
  process.env.DB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const pollSchema = new mongoose.Schema({
  question: String,
  options: [{ text: String, votes: Number }],
});

const Poll = mongoose.model("Poll", pollSchema);

module.exports = Poll;


app.post("/polls", async (req, res) => {
  const { question, options } = req.body;
  const poll = new Poll({
    question,
    options: options.map((option) => ({ text: option, votes: 0 })),
  });
  await poll.save();
  res.json(poll);
});


app.get("/polls", async (req, res) => {
  const polls = await Poll.find();
  res.json(polls);
});

// Vote on a poll
app.post("/polls/:id/vote", async (req, res) => {
  const { optionIndex } = req.body;
  const poll = await Poll.findById(req.params.id);
  if (poll) {
    poll.options[optionIndex].votes += 1;
    await poll.save();
    res.json(poll);
  } else {
    res.status(404).json({ error: "Poll not found" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
