const express = require("express");

const router = express.Router();

const pool = require("../db/database");

// ============================================================
// GET ALL MUNICIPALITIES
// Returns the latest assessment for each municipality.
// ============================================================
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT ON (a.municipality_id)
        m.municipality_id,
        p.province_name,
        m.municipality_name,
        m.municipality_type,
        m.population,
        m.website,
        m.latitude,
        m.longitude,
        a.assessment_id,
        a.assessment_year,
        a.assessment_date,
        a.total_score,
        a.readiness_percentage,
        a.readiness_level,
        a.assessed_by,
        a.remarks
      FROM dgear.assessments a
      JOIN dgear.municipalities m
        ON a.municipality_id = m.municipality_id
      JOIN dgear.provinces p
        ON m.province_id = p.province_id
      ORDER BY
        a.municipality_id,
        a.assessment_year DESC,
        a.assessment_date DESC,
        a.assessment_id DESC;
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

// ============================================================
// GET PARTICULAR MUNICIPALITY DETAILS
//
// Example:
// GET /api/municipalities/details/1
//
// Returns:
// - Municipality information
// - Latest assessment
// - All indicator scores
// - Evidence
// - Remarks
// ============================================================
router.get("/details/:municipalityId", async (req, res) => {
  try {
    const municipalityId = Number(req.params.municipalityId);

    if (!Number.isInteger(municipalityId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid municipality ID",
      });
    }

    // --------------------------------------------------------
    // 1. Get municipality + latest assessment
    // --------------------------------------------------------
    const assessmentQuery = `
      SELECT DISTINCT ON (a.municipality_id)
        m.municipality_id,
        m.municipality_name,
        m.municipality_type,
        m.population,
        m.website,
        m.latitude,
        m.longitude,

        p.province_id,
        p.province_name,

        a.assessment_id,
        a.assessment_year,
        a.assessment_date,
        a.total_score,
        a.readiness_percentage,
        a.readiness_level,
        a.assessed_by,
        a.remarks

      FROM dgear.assessments a

      JOIN dgear.municipalities m
        ON a.municipality_id = m.municipality_id

      JOIN dgear.provinces p
        ON m.province_id = p.province_id

      WHERE m.municipality_id = $1

      ORDER BY
        a.municipality_id,
        a.assessment_year DESC,
        a.assessment_date DESC,
        a.assessment_id DESC;
    `;

    const assessmentResult = await pool.query(assessmentQuery, [
      municipalityId,
    ]);

    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Municipality or assessment not found",
      });
    }

    const municipality = assessmentResult.rows[0];

    // --------------------------------------------------------
    // 2. Get all indicator scores for latest assessment
    // --------------------------------------------------------
    const scoresQuery = `
      SELECT
        i.indicator_id,
        i.indicator_code,
        i.indicator_name,
        i.category,
        i.description,
        i.weight,
        i.max_score,

        s.score,
        s.evidence,
        s.remarks

      FROM dgear.assessment_scores s

      JOIN dgear.indicators i
        ON s.indicator_id = i.indicator_id

      WHERE s.assessment_id = $1

      ORDER BY
        i.indicator_id;
    `;

    const scoresResult = await pool.query(scoresQuery, [
      municipality.assessment_id,
    ]);

    // --------------------------------------------------------
    // 3. Return combined response
    // --------------------------------------------------------
    res.json({
      success: true,

      data: {
        municipality: {
          municipality_id: municipality.municipality_id,
          municipality_name: municipality.municipality_name,
          municipality_type: municipality.municipality_type,
          province_id: municipality.province_id,
          province_name: municipality.province_name,
          population: municipality.population,
          website: municipality.website,
          latitude: municipality.latitude,
          longitude: municipality.longitude,
        },

        assessment: {
          assessment_id: municipality.assessment_id,
          assessment_year: municipality.assessment_year,
          assessment_date: municipality.assessment_date,
          total_score: municipality.total_score,
          readiness_percentage: municipality.readiness_percentage,
          readiness_level: municipality.readiness_level,
          assessed_by: municipality.assessed_by,
          remarks: municipality.remarks,
        },

        indicators: scoresResult.rows,
      },
    });
  } catch (error) {
    console.error("Municipality detail API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch municipality details",
    });
  }
});

module.exports = router;
