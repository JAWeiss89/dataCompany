/** Data Company express application. */

const express = require("express");

const app = express();
const ExpressError = require("./expressError")

// Set up application to expect requests in JSON
app.use(express.json());

// Set up connection to company routes and invoices routes
const companyRoutes = require("./routes/companies");
app.use("/companies", companyRoutes);

const invoiceRoutes = require("./routes/invoices");
app.use("/invoices", invoiceRoutes);




// 404 handler - this is the route that will be encountered should no other route be hit

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

// general error handler 

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
