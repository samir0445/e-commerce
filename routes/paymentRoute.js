import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import Coupon from "../models/coupon.model.js";
import { stripe } from "../config/stripe.js";
import Order from "../models/order.model.js";

const router = express.Router();

// this route just take all the item for order and create a stripe payment session for getting payment
router.post("/create-checkout-session" , protectRoute , async (req , res)=>{
    try {
        const { products , couponCode } = req.body;
        // check that we have getted products array for further stuff
        if(!Array.isArray(products) || products.length === 0){
            return res.status(400).json({ error : "invalid or empty products array"});
        }
        let totalAmount =0;
        const lineItems = products.map(product =>{
            const amount = Math.round(product.price * 100) 
            // becasue stripe wants a amount inthe form of censt that why *100 is require
            totalAmount = amount * quantity;
            // now what fields want form each product

            return{
                price_date :{
                    currency : "usd",
                    product_data :{
                        name :product.name,
                        images :[product.image],

                    },
                    unit_amount :amount
                }

            }
        });
        // now handle coupon code
        let coupon = null;
        if(couponCode){
            coupon = await Coupon.findOne({ code : couponCode , userId : req.user._id , isActive : true});
            if(coupon){
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage /100);
            }
        }
        // now create session
        const session = await stripe.checkout.sessions.create({
            payment_method_types :[" card" , "paypal"],
            line_items : lineItems,
            mode : "payment",
            success_url :`${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url_url :`${process.env.CLIENT_URL}/purchase-cancel}`,
            discounts : coupon?[
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage),
                }
            ]:[],
            metadata :{
                userId : req.user._id.toString(),
                couponCode : couponCode ||"",
                products :JSON.stringify(
                    products.map((p)=>({
                        id : p._id,
                        quantity : p.quantity,
                        price : p.price
                    })) 
                )
            },
        });
        // 20000 cent == 200 dollor
        if(totalAmount >= 20000){
            await createNewCoupon(req.user._id);
        }
        res.status(200).json({ id : session.id , totalAmount : totalAmount / 100});
    } catch (error) {
        
    }
})

async function createStripeCoupon ( discountPercentage){
    const coupon = await stripe.coupons.create({
        precent_off : discountPercentage,
        duration :"once"
    });

    return coupon.id;
}

async function createNewCoupon(userId) {
    const newCoupon = new Coupon({
        code :"GIFT" + Math.random().toString(36).substring(2,8).toUpperCase(),
        discountPercentage : 10,
        expirationDate : new Date(Date.now() + 30*24*60*60*1000),
        userId:userId,

    });
    await newCoupon.save();
    return newCoupon;
    
}

router.post("/checkout-success" , protectRoute , async( req , res)=>{
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if(session.payment_status === " paid"){
            if(session.metadata.couponCode){
                await Coupon.findByIdAndUpdate({
                    code :session.couponCode , userId : session.metadata.userId
                },{
                    isActive :false
                })
            }

            // create a new order
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map(product=>({
                    product : product.id,
                    quantity : product.quantity,
                    price : product.price
                })),
                totalAmount : session.amount_total/100,
                stripeSessionId : sessionId
            })

             await newOrder.save();

             res.status(200).json({
                success : true ,
                message : " payment successfully order created and coupon deactivate",
                orderId : newOrder._id,
             })

        }
    } catch (error) {
        res.json({ message :" error proccessing successful checkout" , error : error.message})
        
    }
})


export default router;