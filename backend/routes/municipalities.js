const express = require("express");

const router = express.Router();

const pool = require("../db/database");

// Get all municipalities with their latest readiness score
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT
        p.province_name,
        m.municipality_name,
        m.latitude,
        m.longitude,
        m.municipality_type,
        m.population,
        a.total_score,
        a.readiness_percentage,
        a.readiness_level
      FROM dgear.assessments a
      JOIN dgear.municipalities m
        ON a.municipality_id = m.municipality_id
      JOIN dgear.provinces p
        ON m.province_id = p.province_id
      ORDER BY a.readiness_percentage DESC;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Municipality API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch municipalities",
    });
  }
});

module.exports = router;
