import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    name :{
        type : String,
        trim : true,
        required :["true" ," name is required"]
    },
    email :{
        type : String,
        required : ["true" , "email is require"],
        lowercase : true,
        unique : true,
        trim :true
    },
    password :{
        type : String,
        required : ["true" , "password is require"],
        minlength : [8,"password must contain minm 8 characters"]
    },
    cartitems : [{
        quantity :{
            type : Number,
            default :1
        },
        product :{
            type : mongoose.Schema.Types.ObjectId,
            ref :"Product"
        }
    }],
    role : {
        type : String,
        enum : ["customer" ,"admin"],
        default : "customer"
    }
},{ timestamps : true})

const User = mongoose.model("User" , userSchema);

// pre fucntion to hash password for any modification

userSchema.pre("save" , async(next)=>{
    if(!this.isModified("password"))
        { 
            return next();}

    // for any modification in pass
   try {
    this.password = await bcrypt.hash(this.password , 10);
    next();
   } catch (error) {
    console.log(error);
    
   }
})

// pre method for check password 
userSchema.methods.camparePass = async ( password)=>{
    return bcrypt.compare(password , this.password);
}
export default User;