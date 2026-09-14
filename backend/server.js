const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db/database");
const municipalityRoutes = require("./routes/municipalities");

const app = express();

app.use(cors());
app.use(express.json());

// Municipality API
app.use("/api/municipalities", municipalityRoutes);

// Home
app.get("/", (req, res) => {
  res.json({
    message: "D-GEAR Nepal API is running",
    status: "operational",
  });
});

// Database health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database connected successfully",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 D-GEAR API running on http://localhost:${PORT}`);
});
