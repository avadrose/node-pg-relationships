const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

const router = new express.Router();


// GET /industries
router.get("/", async function(req, res, next) {
  try {
    const result = await db.query(
      `SELECT i.code,
              i.industry,
              COALESCE(
                ARRAY_AGG(ci.comp_code)
                FILTER (WHERE ci.comp_code IS NOT NULL),
                '{}'
              ) AS companies
       FROM industries AS i
       LEFT JOIN companies_industries AS ci
         ON i.code = ci.industry_code
       GROUP BY i.code, i.industry
       ORDER BY i.code`
    );

    return res.json({
      industries: result.rows
    });
  } catch (err) {
    return next(err);
  }
});


// POST /industries
router.post("/", async function(req, res, next) {
  try {
    const { code, industry } = req.body;

    const result = await db.query(
      `INSERT INTO industries (code, industry)
       VALUES ($1, $2)
       RETURNING code, industry`,
      [code, industry]
    );

    return res.status(201).json({
      industry: result.rows[0]
    });
  } catch (err) {
    return next(err);
  }
});


// POST /industries/:industryCode/companies/:companyCode
router.post("/:industryCode/companies/:companyCode", async function(req, res, next) {
  try {
    const { industryCode, companyCode } = req.params;

    const industryResult = await db.query(
      `SELECT code
       FROM industries
       WHERE code = $1`,
      [industryCode]
    );

    if (industryResult.rows.length === 0) {
      throw new ExpressError("Industry not found", 404);
    }

    const companyResult = await db.query(
      `SELECT code
       FROM companies
       WHERE code = $1`,
      [companyCode]
    );

    if (companyResult.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }

    await db.query(
      `INSERT INTO companies_industries (comp_code, industry_code)
       VALUES ($1, $2)`,
      [companyCode, industryCode]
    );

    return res.status(201).json({
      status: "associated"
    });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;