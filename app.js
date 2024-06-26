const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const itemRoutes = require("./routes/items");
const messageRoutes = require("./routes/messages");
const reviewRoutes = require("./routes/reviews");
const reportRoutes = require("./routes/reports");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/items", itemRoutes);
app.use("/messages", messageRoutes);
app.use("/reviews", reviewRoutes);
app.use("/reports", reportRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** general error handler */

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
