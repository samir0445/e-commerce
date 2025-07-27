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
  try {
    const { email , password } = req.body;
    const user = await User.findOne({email});
    if(!user){
        res.status(400).json({ success : "false ", message : "email is not register"})
    }
    if(user && (await user.camparePass(password))){
        const { accessToken , refreshToken } = generateTokens(user._id);
        await storedRefreshtoken(user._id , refreshToken);
        setCookies(res , accessToken , refreshToken);
    }

    res.json({ success : "true" , message : " logged in successfully"})
    
  } catch (error) {
    return res.json({  success: "false" , message : error.message})
  }
}
export const logout= async(req , res)=>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
        const decodeUser = jwt.verify(refreshToken , process.env.REFRESHTOKEN_KEY);
        await redis.del(`refreshtoken : ${decodeUser.userId}`)// why use userID not clear
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message : " logged out successfulyl"})

    } catch (error) {
        res.json({ message : error.message})
    }
}

export const refresh_token = async ( req , res)=>{
    // basic work
    // first get refresh token from redis to verify
    // verify token to local token
    //decode token and generate new accesstoken
    try {
        const  refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
           return res.status(401).json({  success: "false" , message :" refresh token not getting"})
        }
        
        const decode = jwt.verify(refreshToken ,process.env.REFRESHTOKEN_KEY );
        const storedtoken =  await redis.get(`refreshtoken : ${decode.userId}`);
        
        
        if(storedtoken !== refreshToken){
           return res.status(401).json({  success: "false" , message :"refresh token innvalid"})
        }
        // generate and set accesstoken
        const accesstoken = jwt.sign({ userId : decode.userId} , process.env.ACCESSTOKEN_KEY ,{ expiresIn : "15m"});

        res.cookie("accessToken",accesstoken ,{
            httpOnly :true,
            secure :process.env.NODE_ENV === "production",
            sameSite:"strict",
            maxAge :15*60*1000
        })

        res.json({  success: "true" , message : "accesstoken generated again"})

    } catch (error) {
        res.json({  success: "false" ,error})
    }

    const { refreshToken} = req.cookies.refreshToken;

}