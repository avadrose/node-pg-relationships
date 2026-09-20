const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeAll(async () => {
  // Clean up in case the tests were run before
  await db.query(
    `DELETE FROM companies_industries
     WHERE industry_code = 'jestind'`
  );

  await db.query(
    `DELETE FROM industries
     WHERE code = 'jestind'`
  );
});

afterAll(async () => {
  await db.query(
    `DELETE FROM companies_industries
     WHERE industry_code = 'jestind'`
  );

  await db.query(
    `DELETE FROM industries
     WHERE code = 'jestind'`
  );

  await db.end();
});

describe("Industry Routes", () => {
  test("GET /industries returns industries", async () => {
    const res = await request(app).get("/industries");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.industries)).toBe(true);
  });

  test("POST /industries creates an industry", async () => {
    const res = await request(app)
      .post("/industries")
      .send({
        code: "jestind",
        industry: "Jest Industry"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.industry.code).toBe("jestind");
    expect(res.body.industry.industry).toBe("Jest Industry");
  });

  test("associates an industry with a company", async () => {
    const res = await request(app)
      .post("/industries/jestind/companies/apple");

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("associated");
  });

  test("GET /industries shows company codes", async () => {
    const res = await request(app).get("/industries");

    const industry = res.body.industries.find(
      i => i.code === "jestind"
    );

    expect(industry).toBeDefined();
    expect(industry.companies).toContain("apple");
  });

  test("GET /companies/apple shows industry name", async () => {
    const res = await request(app).get("/companies/apple");

    expect(res.statusCode).toBe(200);
    expect(res.body.company.industries).toContain("Jest Industry");
  });
});