import express from "express";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../Controllers/cart.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const cartRoute = express.Router();

cartRoute.get("/",protectRoute,getCartProducts);

cartRoute.post("/",protectRoute,addToCart);

cartRoute.post("/",protectRoute,removeAllFromCart);

cartRoute.post("/:id",protectRoute,updateQuantity);



export default cartRoute;