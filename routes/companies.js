// All company routes

const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
    
        return res.json({companies : results.rows})
    } catch (e) {
        return next(e);
    }

})

router.get("/:code", async (req, res, next) => {
    try {
        const companyResults = await db.query(
            `SELECT c.name, c.description, i.industry 
            FROM companies AS c
            LEFT JOIN industries_companies AS ic
            ON c.code = ic.company_code
            LEFT JOIN industries AS i
            ON i.code = ic.industry_code
            WHERE c.code=$1`, [req.params.code])
        // const invoiceResults = await db.query(`SELECT id, amt, paid FROM invoices WHERE comp_code=$1`, [code])
    
        const {name, description} = companyResults.rows[0];
        const industries = companyResults.rows.map(c => c.industry)
        console.log({name, description, industries})
        if (companyResults.rows.length === 0) {
            throw new ExpressError(`Couldn't find that company.`, 404)
            }
        // company.invoices = invoiceResults.rows;

        return res.json({name, description, industries})
    } catch (e) {
        return next(e);
    }

})

router.post("/", async (req, res, next) => {
    try {
        const {code, name, description} = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description] )

        return res.status(201).json({company: results.rows[0]})
    } catch (e) {
        return next(e);
    }
})

router.put("/:code", async (req, res, next) => {
    try {
        const {code} = req.params;
        const newCode = slugify(code, {lower: true});
        const {name, description} = req.body;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2, code=$3 WHERE code=$4 RETURNING *`, [name, description, newCode, code])
        if (results.rows.length === 0) {
        throw new ExpressError(`Can't update company with code of ${code}`, 404)
        }
        return res.json({company: results.rows[0]})
    } catch (e) {
        return next(e);
    }
})

router.delete("/:code", async (req, res, next) => {
    try {
        const {code} = req.params;
        const results = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING *`, [code])
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find company with code of ${code}`, 404)
            }
        return res.json({status: "deleted"})
    } catch (e) {
        return next(e);
    }
})

module.exports = router;