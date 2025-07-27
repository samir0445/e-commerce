import express from "express";
import { login, logout, signup, refresh_token} from "../Controllers/auth.controller.js";

const authRouter= express.Router();

authRouter.post("/signup",signup)

authRouter.post("/login",login)

authRouter.post("/logout",logout)

authRouter.post("/refresh_token",refresh_token);

export default authRouter;