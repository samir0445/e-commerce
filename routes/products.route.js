import express from "express";
import { getAllProducts, getfeature, getProductsByCategory, recommendation } from "../Controllers/product.controllers.js";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import { createProduct, deleteProduct } from "../Controllers/product.crud.js";

const productRoute = express.Router();

productRoute.get("/get-all-product",protectRoute , adminRoute,getAllProducts);


productRoute.get("/get-feature-product",getfeature);
productRoute.get("/recommendation",recommendation);
productRoute.get("/category/:category",getProductsByCategory);

productRoute.post("/create-product",protectRoute , adminRoute,createProduct);
productRoute.delete("/:id",protectRoute , adminRoute,deleteProduct);


export default productRoute;