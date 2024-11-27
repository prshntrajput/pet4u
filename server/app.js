const express = require("express")
const app= express()
const cors = require("cors")
const config = require("./utils/config")
const logger = require("./utils/logger")
const middleware = require("./utils/middleware")
const mongoose = require("mongoose")
const user = require("./models/user")

//mongoose connection
mongoose.set("strictQuery",false);
mongoose.connect(config.MONGODB_URL).then((result)=>{
    logger.info("connected to mongoDB")
}).catch((err)=>{
    logger.error(err.message)
})

app.use(cors());
app.use(express.json());







//middlewares
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports= app;