const request = require("supertest");
const app = require("../app");
const db = require("../db");

let invoiceId;

afterAll(async () => {
  await db.end();
});

describe("Invoice Routes", () => {
  test("GET /invoices returns invoices", async () => {
    const res = await request(app).get("/invoices");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.invoices)).toBe(true);
  });

  test("POST /invoices creates an invoice", async () => {
    const res = await request(app)
      .post("/invoices")
      .send({
        comp_code: "apple",
        amt: 600
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.invoice.comp_code).toBe("apple");
    expect(res.body.invoice.amt).toBe(600);

    invoiceId = res.body.invoice.id;
  });

  test("GET /invoices/:id returns one invoice", async () => {
    const res = await request(app).get(`/invoices/${invoiceId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.invoice.id).toBe(invoiceId);
    expect(res.body.invoice.company).toBeDefined();
  });

  test("PUT /invoices/:id marks invoice paid", async () => {
    const res = await request(app)
      .put(`/invoices/${invoiceId}`)
      .send({
        amt: 600,
        paid: true
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.invoice.paid).toBe(true);
    expect(res.body.invoice.paid_date).not.toBeNull();
  });

  test("PUT /invoices/:id marks invoice unpaid", async () => {
    const res = await request(app)
      .put(`/invoices/${invoiceId}`)
      .send({
        amt: 600,
        paid: false
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.invoice.paid).toBe(false);
    expect(res.body.invoice.paid_date).toBeNull();
  });

  test("DELETE /invoices/:id deletes invoice", async () => {
    const res = await request(app).delete(`/invoices/${invoiceId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("deleted");
  });

  test("GET /invoices/999999 returns 404", async () => {
    const res = await request(app).get("/invoices/999999");

    expect(res.statusCode).toBe(404);
  });
});