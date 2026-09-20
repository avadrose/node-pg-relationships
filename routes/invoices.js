const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

const router = new express.Router();


// GET /invoices
router.get("/", async function(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, comp_code
       FROM invoices
       ORDER BY id`
    );

    return res.json({
      invoices: result.rows
    });
  } catch (err) {
    return next(err);
  }
});


// GET /invoices/:id
router.get("/:id", async function(req, res, next) {
  try {
    const invoiceResult = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code
       FROM invoices
       WHERE id = $1`,
      [req.params.id]
    );

    if (invoiceResult.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }

    const invoice = invoiceResult.rows[0];

    const companyResult = await db.query(
      `SELECT code, name, description
       FROM companies
       WHERE code = $1`,
      [invoice.comp_code]
    );

    invoice.company = companyResult.rows[0];

    delete invoice.comp_code;

    return res.json({
      invoice
    });
  } catch (err) {
    return next(err);
  }
});


// POST /invoices
router.post("/", async function(req, res, next) {
  try {
    const { comp_code, amt } = req.body;

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
       VALUES ($1, $2)
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.status(201).json({
      invoice: result.rows[0]
    });
  } catch (err) {
    return next(err);
  }
});


// PUT /invoices/:id
router.put("/:id", async function(req, res, next) {
  try {
    const { amt } = req.body;

    const result = await db.query(
      `UPDATE invoices
       SET amt = $1
       WHERE id = $2
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, req.params.id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }

    return res.json({
      invoice: result.rows[0]
    });
  } catch (err) {
    return next(err);
  }
});


// DELETE /invoices/:id
router.delete("/:id", async function(req, res, next) {
  try {
    const result = await db.query(
      `DELETE FROM invoices
       WHERE id = $1
       RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }

    return res.json({
      status: "deleted"
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;