// src/config/stripe.js
import Stripe from 'stripe';
import { env } from './env.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export default stripe;
