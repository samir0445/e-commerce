import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";

const app = express();

app.use(express.json());

app.use("/api/auth" , authRouter);

app.listen( process.env.PORT || 3000 ,()=>{
    console.log(" server started bady");
})
