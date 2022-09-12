import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose"
import CarRoutes from "./routes/cars.js"
import * as dotenv from "dotenv";
dotenv.config();



const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello");
});

app.use("/cars", CarRoutes);



app.listen(3000, () => {mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log("Connected to database"))

    console.log("server started");
})