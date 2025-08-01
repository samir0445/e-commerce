import { redis } from "../config/redis.js";
import Product from "../models/product.models.js";

export const getAllProducts= async(req,res)=>{
try {
    const products = await Product.find({}) ;// find() gives only onne product used find({})

} catch (error) {
   return res.status(500).json({ success : "false" , message: error.message});
}
};

export const getfeature = async ( req , res)=>{
    try {// only for second time || when we have set in reids for first time
        let featuredProducts = await redis.get("feature_product");
        // if we get it from redis then w have to retuen form here
        if(featuredProducts){
            // parse it because redis give in json from
            console.log(" redis bhaine de diya");
            
            return res.json(JSON.parse(featuredProducts));
        }
        // we came if we dont find from redis now have to find in product databse
        //and at he end save to redis for future
        featuredProducts = await Product.find({isFeatured : true}).lean();
        // lean() return plain javascript object rather than Mongodb documnet
        if(!featuredProducts){
             return res.status(401).json({ success : "false" , message: " no featured product found"});
        }

        //set in redis
        await redis.set("feature_product" , JSON.stringify(featuredProducts));
        res.json(featuredProducts);

    }
     catch (error) {
         return res.status(500).json({ success : "false" , message: error.message});
    }
}

export const recommendation = async(req , res)=>{
    try {
        const products = await Product.aggregate([
            // samp;e size like i want 3 random products
            {
                $sample : {size:3}
            },
            { // the value- field of that projetc that i want as response
                $project:{
                    _id : 1,
                    name : 1,
                    description : 1,
                    image : 1,
                    price : 1,
                }
            }
        ])
        res.json(products);
    } catch (error) {
         return res.status(500).json({ success : "false" , message: error.message});
    }
}

export const getProductsByCategory = async(req,res)=>{
    const { category} = req.params;
    try {
         const products = await Product.find({ category });
         res.json(products)
        
    } catch (error) {
         return res.status(500).json({ success : "false" , message: error.message});
    }
   
}

export const toggledFeatuted = async(req,res)=>{
    try {
        const product = await Product.findById(req.params.id);
        if(product){
            product.isFeatured = !product.isFeatured;
            await product.save(); // check is ti working
            await updateFeaturedProductsCache();
            res.json(product)

        }else{
            return res.status(401).json({ success : "false" , message: " no toggle product found"});
        }
    } catch (error) {
         return res.status(500).json({ success : "false" , message: error.message});
    }
}

async function  updateFeaturedProductsCache() {
    try {
        const featuredProducts = await Product.find({isFeatured : true}).lean();
        await redis.set("feature_product" ,JSON.stringify(featuredProducts));

    } catch (error) {
        console.log("erroer while update in cache");
        
        return res.status(500).json({ success : "false" , message: error.message});
    }
}