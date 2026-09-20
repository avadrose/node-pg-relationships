const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

const router = new express.Router();

router.get("/", async function(req, res, next) {
  try {
    const result = await db.query(
      `SELECT code, name
       FROM companies
       ORDER BY code`
    );

    return res.json({
      companies: result.rows
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/:code", async function(req, res, next) {
  try {
    const companyResult = await db.query(
      `SELECT code, name, description
       FROM companies
       WHERE code = $1`,
      [req.params.code]
    );

    if (companyResult.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }

    const invoiceResult = await db.query(
      `SELECT id
       FROM invoices
       WHERE comp_code = $1`,
      [req.params.code]
    );

    const industryResult = await db.query(
      `SELECT i.industry
       FROM industries AS i
       JOIN companies_industries AS ci
         ON i.code = ci.industry_code
       WHERE ci.comp_code = $1
       ORDER BY i.industry`,
      [req.params.code]
    );

    const company = companyResult.rows[0];

    company.invoices = invoiceResult.rows.map(invoice => invoice.id);

    company.industries = industryResult.rows.map(
      industry => industry.industry
    );

    return res.json({
      company
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function(req, res, next) {
  try {
    const { name, description } = req.body;

    const code = slugify(name, {
        lower: true, 
        strict: true
    });

    const result = await db.query(
      `INSERT INTO companies (code, name, description)
       VALUES ($1, $2, $3)
       RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json({
      company: result.rows[0]
    });
  } catch (err) {
    return next(err);
  }
});

router.put("/:code", async function(req, res, next) {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      `UPDATE companies
       SET name = $1,
           description = $2
       WHERE code = $3
       RETURNING code, name, description`,
      [name, description, req.params.code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }

    return res.json({
      company: result.rows[0]
    });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:code", async function(req, res, next) {
  try {
    const result = await db.query(
      `DELETE FROM companies
       WHERE code = $1
       RETURNING code`,
      [req.params.code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }

    return res.json({
      status: "deleted"
    });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;