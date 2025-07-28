import jwt from "jsonwebtoken";
import User from "../models/user.models.js";



export const protectRoute = async( req ,res,next)=>{

    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken){
           return res.status(401).json({ success : "false" , message:" not getting accessTOken"});
        }
        
        // now check accesstoken validation
        try {
             const decode =  jwt.verify(accessToken , process.env.ACCESSTOKEN_KEY);
            const user = await User.findOne(decode.userId).select("-password");// to deselect password

            if(!user){
            res.status(401).json({ success : "false" , message:"user not getted"});
            }
            req.user = user;
            next();
        } catch (error) {
            if(error.name === "TokenExpiredError"){
               return res.status(401).json({ success : "false" , message:"unauthorised - access token expired"}); 
            }
            throw error;
        }
    } catch (error) {
        return res.status(500).json({ success : "false" , message: error.message});
    }
}

export const  adminRoute =( req ,res,next)=>{ 
        
        if(req.user && (req.user.role === "admin") ){
            next();
        }else {
            status(403).json({ success : "false" , message:"access denied -only for admin"});
        }
        next();
}