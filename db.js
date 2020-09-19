/** Database setup for Data Company. */

const { Client } = require("pg"); // What we need from pg is Client so we can destructure

let DB_URI;

// If we're running in test "mode", use our test db
if (process.env.NODE_ENV === "test") {
    DB_URI = "postgresql:///data_company_db_test";
} else {
    DB_URI = "postgresl:///data_company_db";
}

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;