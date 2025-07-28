import mongoose from "mongoose"; 

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required :["true" , "product name is missing"]
    },
    description : {
        type : String,
        required :["true" , "product name is missing"]
    },
    price : {
        type : Number,
        min :0,
        required :["true" , "product name is missing"]
    },
    quntity : {
        type : Number,
        min :0,
        required :["true" , "quntity missing is missing"]
    },
    price : {
        type : Number,
        min :0,
        required :["true" , "product name is missing"]
    },
    image : {
        type : String,
        required :["true" , "image missing"]
    },
    category : {
        type : String,
        required :["true" , "specify the category"]
    },
    isFeatured : {
        type : Boolean,
        default : false
    }
},{timestamps : true})

const Product = mongoose.model("Product" , productSchema)


export default Product;