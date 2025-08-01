import Product from "../models/product.models.js";


export const addToCart = async ( req , res)=>{
    try {
        const {productId} = req.body;
        const user = req.user;

        const existingItem = user.cartitems.find((item) => item.id === productId); 
        if(existingItem)
        {
            existingItem.quantity +=1;

        }else{
            user.cartitems.push(productId)
        }
        await user.save();
        res.json({ success :"true" , item : productId});

    } catch (error) {
        return res.status(500).json({ success : "false" , message: error.message});
    }

    
}


export const removeAllFromCart = async ( req , res)=>{
    try {
        const {productId} = req.body;
        const user = req.user;

        const existingItem =   user.cartitems.find(item => item.id === productId); 
        if(!existingItem)
        {
            user.cartitems = [];

        }else{
           user.cartitems = user.cartitems.filter((item)=> item.id !== productId);
        }
        await user.save();
        res.json({ success :"true" , item : user.cartitems});

    } catch (error) {
        return res.status(500).json({ success : "false" , message: error.message});
    }


}

export const updateQuantity = async ( req , res)=>{
    try {
        
        const {id:productId } = req.params;
        const {quantity } = req.body;
        const user = req.user;

        const existingItem =  user.cartitems.find((item)=> item.id === productId);
        if(existingItem){
            if(quantity === 0){
                user.cartitems = user.cartitems.filter((item)=> item.id !== productId);
                await user.save();
                return res.json({ success :" true" , data : user.cartitems});
            }
            existingItem.quantity = quantity;
            await user.save();
            return res.json({ success :" true" , data : user.cartitems});
        }else{
            res.status(404).json({message :" product not found"});
        }

    } catch (error) {
        return res.status(500).json({ success : "false" , message: error.message});
    }
}
export const getCartProducts= async ( req , res)=>{
    try {
        const products = await Product.find({ _id :{$in:req.user.cartitems}});
        // this product does have associated quntity so wehave map there qusntity
        const cartitems =products.map(product =>{
            const item = req.user.cartitems.find(cartitem => cartitem.id === product.id);
            return {...product.toJSON(),quantity : item.quantity}

            //... (spread operator) copies all properties of the product into a new object.

        })
        res.json(cartitems)
        
    } catch (error) {
        return res.status(500).json({ success : "false" , message: error.message});
    }

}

//to check this route because i have manually added qunttiy in database wich is wrong
