import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import connectDB from "./config/mongodb.js";
import cartRoute from "./routes/cart.route.js";
import productRoute from "./routes/products.route.js";
import couponsRoute from "./routes/coupons.route.js";
import router from "./routes/paymentRoute.js";

const app = express();


app.use(express.json());
app.use(cookieParser());

app.use("/api/auth" , authRouter);
app.use("/api/product" , productRoute);
app.use("/api/cart" , cartRoute);
app.use("/api/coupon" , couponsRoute);
app.use("/api/payment" , router);

app.listen( process.env.PORT || 3000 ,()=>{
    connectDB(); // database connection
    console.log(" server started bady");
})
