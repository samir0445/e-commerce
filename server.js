import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.get("/" , (req,res)=>{
    res.send("git op");
})

app.listen( process.env.PORT || 3000 ,()=>{
    console.log(" server started bady");
})
