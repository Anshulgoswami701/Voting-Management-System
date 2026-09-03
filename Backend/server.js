const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const electionRoutes = require("./routes/electionRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voteRoutes");
const voterRoutes = require("./routes/voterRoutes");
const adminRoutes = require("./routes/adminRoutes");
const resultsRoutes = require("./routes/resultsRoutes");

const {
  updateElectionStatuses,
} = require("./controllers/electionController");

dotenv.config();

connectDB();

setInterval(async () => {
  await updateElectionStatuses();
}, 60 * 1000);

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "12mb" }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", adminRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/voters", voterRoutes);
app.use("/api/results", resultsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Voting Management System API is running",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});