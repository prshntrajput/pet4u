const express = require("express")
const app= express()
const cors = require("cors")
const config = require("./utils/config")
const logger = require("./utils/logger")
const middleware = require("./utils/middleware")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");
const userRouter = require("./controllers/user");
const loginRouter = require("./controllers/login")
const animalRouter = require("./controllers/animalPost")
const adoptionRouter = require("./controllers/adoption")

//mongoose connection
mongoose.set("strictQuery",false);
mongoose.connect(config.MONGODB_URL).then((result)=>{
    logger.info("connected to mongoDB")
}).catch((err)=>{
    logger.error(err.message)
})

app.use(cors({
    origin: 'http://localhost:5173', // React app origin
    credentials: true, // Allow credentials (cookies)
}));
app.use(express.json());
app.use(cookieParser()); 

app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/animals", animalRouter);
app.use("/api/adoption", adoptionRouter);





//middlewares
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports= app;