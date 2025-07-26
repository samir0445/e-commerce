import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { redis } from "../config/redis.js";



 const generateTokens = (userId)=>{
    const accessToken = jwt.sign( {userId} ,process.env.ACCESSTOKEN_KEY, {
        expiresIn : "15m",
    })
    const refreshToken = jwt.sign( {userId} ,process.env.REFRESHTOKEN_KEY, {
        expiresIn : "2d",
    })

    return { accessToken , refreshToken};
 }

const storedRefreshtoken = async ( userId , refreshToken)=>{
    await redis.set(`refreshtoken : ${userId}` , refreshToken ,"EX" , 2*24*60*60);
}

const setCookies =async (res , accessToken ,refreshToken)=>{
    res.cookie("accessToken", accessToken,{
        httpOnly :true,
        secure :process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge :15*60*1000
    })
    res.cookie("refreshToken", refreshToken,{
        httpOnly :true,
        secure :process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge : 2*24*60*60*1000
    })
}

export const signup= async(req , res)=>{
    try {
        const { name , email , password} = req.body;
        // check email existance
        const userExists = await User.findOne({email});

        if(userExists) {
            res.status(400).json({ success : "false" , message : " email already register"})
        }

        const user = await User.create({name , email , password});

        //authenticate
        const {accessToken , refreshToken } = generateTokens(user.id);
        await storedRefreshtoken(user._id , refreshToken);
        setCookies(res ,accessToken ,refreshToken);

        res.status(200).json({ success : "true" , message : "user registerd" , user})

    } catch (error) {
        console.log( "from signup"+ error);
        
    }
}
export const login= async(req , res)=>{

}
export const logout= async(req , res)=>{

}