const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const electionRoutes = require("./routes/electionRoutes");
const connectDB = require("./config/db");

// ✅ New Import
const {
  updateElectionStatuses,
} = require("./controllers/electionController");

dotenv.config();

connectDB();

// ✅ Every 1 minute election status update hoga
setInterval(async () => {
  await updateElectionStatuses();
}, 60 * 1000);

const app = express();

app.use(cors());
app.use(express.json());

// Auth Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Election Routes
app.use("/api/elections", electionRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "Voting Management System API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});