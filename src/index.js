import express from "express";
import winston from "winston";
import gradesRouter from "./routes/grades.js";
import cors from "cors";
const app = express();

global.fileName = "./json/grades.json";

const { combine , timestamp, label, printf } = winston.format;
const myFormat = printf(( { level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
    level:"silly",
    transports:[
        new (winston.transports.Console)(),
        new (winston.transports.File)({filename: "grades.log"}) 
    ],
    format: combine(
        label({label: "grades"}),
        timestamp(),
        myFormat
    )
});


app.use(express.json());
app.use(cors());
app.use("/grade", gradesRouter)

app.listen(3000, function () {
    console.log("Api")
})

