// All invoice routes

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const app = require("../app");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json(results.rows);

    } catch(e) {
        next(e);
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const {id} = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id])
        if (results.rows.length==0) {
            throw new ExpressError(`Could not find invoice with id: ${id}`, 404);
        }

        return res.json(results.rows[0])
    } catch(e) {
        next(e);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const {comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1,$2) RETURNING *`, [comp_code, amt])

        return res.status(201).json(results.rows[0]);

    } catch(e) {
        next(e);
    }
})

router.put("/:id", async (req, res, next) => {
    try {
        const {amt} = req.body;
        const {id} = req.params;
        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`, [amt, id]);
        if (results.rows.length==0) {
            throw new ExpressError(`Could not update invoice with id: ${id}`, 404);
        }
        return res.json(results.rows[0]);

    } catch(e) {
        next(e);
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const {id} = req.params;
        const results = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING *`, [id])
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not delete invoice with id ${id}`, 404)
        }
        return res.json({message: `Invoice of ID ${id} was deleted`})
    } catch(e) {
        next(e);
    }
})






module.exports = router;