import express from "express";

const authRouter= express.Router();

authRouter.get("/",
    (req,res)=>{
    res.send("git op");
})

export default authRouter;