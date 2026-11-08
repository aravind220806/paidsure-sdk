# PaidSure Client SDK ⚡

The official public client SDK and integration guide for **PaidSure** — the zero-fee, non-custodial UPI payment confirmation gateway for Indian merchants and developers.

---

## 🚀 Features

* **Zero Transaction Fees:** 100% of the customer's payment goes directly into your bank account.
* **Instant Direct Settlements:** No 2-3 day payout delays. Money is in your account the moment the customer authorizes the UPI PIN.
* **Hosted Dynamic Checkout:** Automatic QR code, Google Pay, PhonePe, Paytm, and CRED app switchers.
* **Triple-UPI Redundancy:** Automatic multi-VPA failover so high traffic never causes payment drops.
* **Bank UTR Verification:** Webhooks deliver verified bank UTRs and raw evidence records.

---

## 📦 Installation

```bash
npm install @paidsure/sdk
```

---

## 🛠️ Quickstart (Node.js / Express)

### 1. Initialize the Client

```javascript
import { PaidSure } from "@paidsure/sdk";

const paidsure = new PaidSure({
  apiKey: process.env.PAIDSURE_API_KEY, // e.g. "psm_live_..."
  webhookSecret: process.env.PAIDSURE_WEBHOOK_SECRET, // e.g. "psw_sec_..."
});
```

### 2. Create an Order & Redirect Customer

```javascript
app.post("/checkout", async (req, res) => {
  const order = await paidsure.createOrder({
    amount: 499,                     // Whole rupees (₹499)
    note: "2 × Graphic T-Shirt",     // Item description
    customerName: "Rahul Sharma"     // Customer name
  });

  // Redirect customer to the hosted payment page
  res.redirect(order.statusUrl);
});
```

### 3. Handle Webhook Confirmation

```javascript
app.post("/api/paidsure-webhook", (req, res) => {
  const signature = req.headers["x-paidsure-signature"];
  const isValid = paidsure.verifyWebhookSignature(req.body, signature);

  if (!isValid) {
    return res.status(401).send("Invalid signature");
  }

  const { event, order, payment } = req.body;
  if (event === "order.paid") {
    console.log(`Payment confirmed for Order: ${order.ref}`);
    console.log(`Verified Bank UTR: ${payment.utr}`);
    console.log(`Received via: ${payment.channel}`);

    // Fulfill the order, unlock access, or ship the package!
  }

  res.json({ received: true });
});
```

---

## 🌐 Plain cURL / REST API

If you aren't using Node.js, you can use raw HTTP requests from any backend language (Python, PHP, Go, Ruby):

```bash
curl -X POST https://paid-sure.vercel.app/api/orders \
  -H "Authorization: Bearer psm_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 999,
    "note": "Subscription Plan",
    "customerName": "Pooja"
  }'
```

**Response:**
```json
{
  "ok": true,
  "order": {
    "ref": "PS-8921a4",
    "amount": "999.37",
    "statusUrl": "https://paid-sure.vercel.app/s/PS-8921a4"
  }
}
```

---

## 🔒 Security Policy

PaidSure operates on a non-custodial architecture. Store your `psm_live_...` API key strictly in your server environment variables (`.env`). Never expose it in client-side HTML or frontend React bundles.

---

## 📄 License

MIT License © PaidSure Team.
