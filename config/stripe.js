import Stripe from "stripe";
import "dotenv/config";

export const stripe = new Stripe(process.env.STRPIE_SECRET_KEY);