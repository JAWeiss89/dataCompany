process.env.NODE_ENV = "test"; // This will make sure we use the test database

const request = require("supertest");
const app = require("../app");
const db = require("../db");

// ===============================
//   TEST SET UP 
// ===============================

let testInvoice;

beforeEach( async() => {
    let results = await db.query(`
        INSERT INTO invoices (comp_code, amt, paid)
        VALUES ('apple', '25', 'false')
        RETURNING *`);
    testInvoice = results.rows[0];
})


// ===============================
//   TESTS
// ===============================

describe("GET /invoices", () => {
    test("Gets all invoices", async () => {
        const res = await request(app).get("/invoices");

        expect(res.statusCode).toBe(200);
        // expect(res.body).toContain(testInvoice);
    })
})

describe("GET /invoices/:id", () => {
    test("Gets one invoice", async() => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.comp_code).toEqual(testInvoice.comp_code);
    })
})

describe("POST /invoices", () => {
    test("Adds one new invoice", async() => {
        const newInvoice = {comp_code: "amzn", amt: 99}
        const res = await request(app)
            .post("/invoices")
            .send(newInvoice);
        
        expect(res.statusCode).toBe(201);
        expect(res.body.amt).toEqual(99);
        
    })
})

describe("PUT /invoices/:id", () => {
    test("Edits invoice", async() => {
        const res = await request(app)
            .put(`/invoices/${testInvoice.id}`)
            .send({amt: 888});
        
        expect(res.statusCode).toBe(200);
        expect(res.body.amt).toEqual(888);
    })
    test("Returns 404 if invoice not found", async() => {
        const res = await request(app).put('/invoices/9999').send({amt: 888});

        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /invoices/:id", () => {
    test("Invoice Deleted", async() => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({message: `Invoice of ID ${testInvoice.id} was deleted`})
    })
})


// ===============================
//   TEST TEAR DOWN
// ===============================

afterEach( async () => {
    await db.query(`DELETE FROM invoices WHERE id=${testInvoice.id}`)
})

afterAll(async () => {
    await db.end();
})