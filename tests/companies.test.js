process.env.NODE_ENV = "test"; // This will make sure we use the test database

const request = require("supertest");
const app = require("../app");
const db = require("../db");

// ===============================
//   TEST SET UP 
// ===============================

let testCompany;


beforeEach( async ()=> {
    let results = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('abnb', 'Airbnb', 'easy short term rentals')
        RETURNING *`);
    testCompany = results.rows[0];
    
})

// ===============================
//   TESTS
// ===============================
  

describe("GET /companies", () => {
    test("Gets all companies", async() => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body.companies).toContainEqual(testCompany);
    })
})

describe("GET /companies/:code", ()=> {
    test("Gets a single company", async()=> {
        testCompany.invoices=[];
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.company).toEqual(testCompany)
    })
    test("Responds with 404 if company doesn't exist in db", async()=> {
        const res = await request(app).get(`/companies/idontexist`);
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /companies", () => {
    test("Adds new company to list", async() => {
        const newCo = {code:"flix", name:"Netflix", description:"video streaming"};
        const res = await request(app)
            .post("/companies")
            .send(newCo);
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: newCo});

    })
})

describe("PUT /companies", () => {
    test("Edit company", async() => {
        const res = await request(app)
            .put(`/companies/${testCompany.code}`)
            .send({name: "Airbnb 2.0", description: "The new and improved Airbnb"});
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {code: testCompany.code, name:"Airbnb 2.0", description: "The new and improved Airbnb"}})
    })
    test("Responds with 404 if company doesn't exist in db", async()=> {
        const res = await request(app).put(`/companies/idontexist`);
        expect(res.statusCode).toBe(404);
    })
})


describe("DELETE /companies/:code", () => {
    // amzn is currently in the datbase. we will make it again during teardown
    test("Remove company", async() => {
        const res = await request(app).delete('/companies/amzn');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: "deleted"})
    })
})
// ===============================
//   TEST TEAR DOWN
// ===============================

afterEach( async () => {
    let results = await db.query(`
        DELETE FROM companies WHERE code='abnb' RETURNING *`)
})

afterAll(async function() {
    // close db connection
    await db.query(`DELETE FROM companies WHERE code='flix' RETURNING *`)
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('amzn','Amazon', 'ebook company. lol')`)
    await db.end();
});