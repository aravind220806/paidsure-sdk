/**
 * Simple 10-line Express store example using PaidSure SDK
 */
import express from "express";
import { PaidSure } from "../dist/index.js";

const app = express();
app.use(express.json());

// Initialize PaidSure with your secret PSM key
const paidsure = new PaidSure({
  apiKey: process.env.PAIDSURE_API_KEY || "psm_live_sample_key_here",
  webhookSecret: process.env.PAIDSURE_WEBHOOK_SECRET,
  baseUrl: "http://localhost:4000", // or your live PaidSure domain
});

// 1. Checkout Endpoint: Customer clicks "Buy Now"
app.post("/buy", async (req, res) => {
  try {
    const order = await paidsure.createOrder({
      amount: 499, // ₹499
      note: "Graphic Cotton Tee (Size L)",
      customerName: "Aravind",
    });

    // Send customer to the hosted checkout page
    res.json({ checkoutUrl: order.statusUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Webhook Endpoint: PaidSure notifies your site when payment is confirmed
app.post("/api/paidsure-webhook", (req, res) => {
  const signature = req.headers["x-paidsure-signature"];
  const isValid = paidsure.verifyWebhookSignature(req.body, signature);

  if (!isValid) {
    return res.status(401).send("Invalid signature");
  }

  const { event, order, payment } = req.body;
  if (event === "order.paid") {
    console.log(`🎉 Payment received for Order ${order.ref}! Bank UTR: ${payment.utr}`);
    // Update your database, unlock access, or ship the package!
  }

  res.json({ received: true });
});

app.listen(3000, () => console.log("Shop running on http://localhost:3000"));
