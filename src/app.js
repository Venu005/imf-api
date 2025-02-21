const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const gadgetsRouter = require("./routes/gadgets");
const authRouter = require("./routes/auth");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://imf-api-bcqt.onrender.com",
  })
);
app.options("*", cors());
// Routes
app.use("/auth", authRouter);
app.use("/gadgets", gadgetsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
