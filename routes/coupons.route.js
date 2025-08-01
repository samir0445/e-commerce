import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getCoupon, validateCoupon } from "../Controllers/coupon.controller.js";

const couponsRoute = express.Router();

couponsRoute.get("/" , protectRoute , getCoupon);
couponsRoute.post("/validate" , protectRoute ,validateCoupon);


export default couponsRoute;