import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.models.js";

export const createProduct = async(req,res)=>{
    try {
        const { name , description , price  , image  , category } = req.body;
        let cloudinaryResponse = null;
        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image , { folder :"products"})
        }
        const product =await Product.create({
            name,
            description,
            price,
            image : cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url :"",
            category
        });
        return res.status(201).json(product);
    } catch (error) {
        return res.status(500).json({ success : "false" , message: error.message});
    }
}

export const deleteProduct= async(req,res)=>{
    try {
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({ success : "false" , message: "product not founnd"});
        }

        if(product.image){
            const publicId =product.image.split("/").pop().split(".")[0];
            // Extracts the public ID (filename without extension) from the image URL.
            // Useful for referencing or manipulating the image in services like Cloudinary.
            // Example: "https://example.com/images/item123.png" → publicId = "item123"

            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
                 console.log(" delete from cloudinary");
                
            } catch (error) {
                  return res.status(500).json({ success : "false" , message:"cloudinary error"});
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success :"true" , message :" delete successfully"});
        
    } catch (error) {
        return res.status(500).json({ success : "false" , message: error.message});
    }
}