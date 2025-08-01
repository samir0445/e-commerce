import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        require : true
    },
    products :[
        {
        product :{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Product",
        require : true
        },
        quantity :{
        type : Number,
        min : 1,
        require : true
        },
        price :{
        type : Number,
        min : 0,
        require : true
        },
    },],
    totalAmount : {
        type : Number,
        require : true ,
        min :0,
    },
    stripeSessionId :{
        type : String,
        unique : true,
    }
} , { timestamps : true});

const Order = mongoose.model("Order" , orderSchema);

export default Order;