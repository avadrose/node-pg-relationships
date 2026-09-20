const request = require("supertest");
const app = require("../app");
const db = require("../db");

afterAll(async () => {
  await db.end();
});

describe("Company Routes", () => {
  test("GET /companies returns companies", async () => {
    const res = await request(app).get("/companies");

    expect(res.statusCode).toBe(200);
    expect(res.body.companies).toBeDefined();
    expect(Array.isArray(res.body.companies)).toBe(true);
  });

  test("GET /companies/apple returns one company", async () => {
    const res = await request(app).get("/companies/apple");

    expect(res.statusCode).toBe(200);
    expect(res.body.company.code).toBe("apple");
    expect(res.body.company.invoices).toBeDefined();
    expect(res.body.company.industries).toBeDefined();
  });

  test("POST /companies creates a slugified company", async () => {
    const res = await request(app)
      .post("/companies")
      .send({
        name: "Jest Test Company",
        description: "Created during testing"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.company.code).toBe("jest-test-company");
  });

  test("PUT /companies/:code updates a company", async () => {
    const res = await request(app)
      .put("/companies/jest-test-company")
      .send({
        name: "Updated Jest Company",
        description: "Updated during testing"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.company.name).toBe("Updated Jest Company");
  });

  test("DELETE /companies/:code deletes a company", async () => {
    const res = await request(app)
      .delete("/companies/jest-test-company");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("deleted");
  });

  test("GET /companies/not-real returns 404", async () => {
    const res = await request(app).get("/companies/not-real");

    expect(res.statusCode).toBe(404);
  });
});