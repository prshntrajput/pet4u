const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("./config/logger");

const app = express();

app.use(cors({ origin: "https://pet4u-zeta.vercel.app", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/pets", require("./routes/pet"));
app.use("/api/adopt", require("./routes/adoption"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/messages", require("./routes/messagerouter"));



app.get("/", (req, res) => {
  logger.info("Welcome to Pet Adoption API");
  res.send("API Running...");
});

module.exports = app;
