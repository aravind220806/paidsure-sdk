<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,14,20&height=190&section=header&text=PaidSure%20SDK&fontSize=68&fontColor=ffffff&animation=twinkling&fontAlignY=36" alt="PaidSure SDK Header" width="100%" />

<a href="https://github.com/aravind220806/paidsure-sdk">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&duration=3000&pause=1200&color=6D5EFC&center=true&vCenter=true&width=860&height=80&lines=Official+Developer+SDK+for+PaidSure+UPI;Zero-Fee+Checkout+%7C+Direct-to-Bank+Settlement;One-line+integration+for+Node.js%2C+Python%2C+and+Websites.;Say+goodbye+to+2%25+gateway+fees+and+payout+delays." alt="Typing animation" />
</a>

<br>

[![npm version](https://img.shields.io/badge/npm-v1.0.0-30D158?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-6D5EFC?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)

<br>

**[⚡ Features](#-why-paidsure)** &nbsp;·&nbsp;
**[📦 Installation](#-installation)** &nbsp;·&nbsp;
**[🚀 3-Minute Quickstart](#-3-minute-quickstart)** &nbsp;·&nbsp;
**[🤖 AI Agent Protocol (AGENT.md)](./AGENT.md)** &nbsp;·&nbsp;
**[📡 Webhooks](#-handling-webhooks)** &nbsp;·&nbsp;
**[💻 Multi-Language Support](#-other-languages-python-curl-php)** &nbsp;·&nbsp;
**[📱 How It Works for Buyers](#-the-buyer-experience)** &nbsp;·&nbsp;
**[🛡️ Security](#️-security-best-practices)**

</div>

---

## ⚡ Why PaidSure?

PaidSure is a **zero-fee UPI payment confirmation gateway** designed for Indian businesses, online stores, creators, and developers.

| Feature | Traditional Gateways (Razorpay / Cashfree) | PaidSure |
|---|:---:|:---:|
| **Transaction Fees** | **~2% + GST** per sale | **₹0 (Zero platform cut)** |
| **Settlement Time** | **2 to 3 Days** hold | **Instant (Direct into your Bank)** |
| **Payment Method** | Cards, Netbanking, Wallets | **Direct UPI (GPay, PhonePe, Paytm, CRED)** |
| **Fake Screenshots** | Manual WhatsApp review risk | **Impossible (Auto-verified via Bank UTR)** |
| **Setup Time** | Days of KYC paperwork & approvals | **2 Minutes (Instant API Key)** |

---

## 📦 Installation

Install the official client via your preferred package manager:

```bash
# npm
npm install @paidsure/sdk

# yarn
yarn add @paidsure/sdk

# pnpm
pnpm add @paidsure/sdk
```

---

## 🚀 3-Minute Quickstart

Accepting payments with PaidSure takes only **two simple steps**:

### 1. Initialize the Client

Add your secret Merchant Key to your server's `.env` file:
```env
PAIDSURE_API_KEY="psm_live_your_secret_key_here"
PAIDSURE_WEBHOOK_SECRET="psw_sec_your_webhook_secret_here"
```

Initialize PaidSure in your backend:
```javascript
import { PaidSure } from "@paidsure/sdk";

const paidsure = new PaidSure({
  apiKey: process.env.PAIDSURE_API_KEY,
  webhookSecret: process.env.PAIDSURE_WEBHOOK_SECRET,
});
```

---

### 2. Create an Order (When Customer Clicks "Buy")

When a customer checks out, create an order from your backend and redirect them to the hosted `statusUrl`:

```javascript
app.post("/buy", async (req, res) => {
  try {
    const order = await paidsure.createOrder({
      amount: 499,                     // Whole rupees (₹499)
      note: "Organic Cotton Tee (L)",  // Shown in customer's UPI app
      customerName: "Aravind Sharma"   // Customer name
    });

    // Send the customer to PaidSure's hosted checkout page
    res.json({ checkoutUrl: order.statusUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📡 Handling Webhooks

PaidSure notifies your server the exact millisecond the money lands in your bank account.

Set up an endpoint to receive the `order.paid` event and verify the cryptographic signature:

```javascript
app.post("/api/paidsure-webhook", (req, res) => {
  const signature = req.headers["x-paidsure-signature"];
  const isValid = paidsure.verifyWebhookSignature(req.body, signature);

  if (!isValid) {
    return res.status(401).send("Invalid signature");
  }

  const { event, order, payment } = req.body;

  if (event === "order.paid") {
    console.log(`🎉 Payment verified for Order ${order.ref}`);
    console.log(`💰 Amount: ₹${order.amount}`);
    console.log(`🏦 Bank UTR: ${payment.utr}`);
    console.log(`👤 Customer: ${order.customerName}`);

    // Mark the order as PAID in your database, unlock access, or ship items!
  }

  res.json({ received: true });
});
```

---

## 💻 Other Languages (Python, cURL, PHP)

You don't need Node.js to use PaidSure. You can call the REST API from any programming language:

### Python (FastAPI / Flask / Django)

```python
import requests

response = requests.post(
    "https://paid-sure.vercel.app/api/orders",
    headers={
        "Authorization": "Bearer psm_live_your_key_here",
        "Content-Type": "application/json"
    },
    json={
        "amount": 999,
        "note": "Pro Annual Plan",
        "customerName": "Rohan Verma"
    }
)

order = response.json()["order"]
# Redirect customer to: order["statusUrl"]
```

### Raw cURL

```bash
curl -X POST https://paid-sure.vercel.app/api/orders \
  -H "Authorization: Bearer psm_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1499,
    "note": "Denim Jacket",
    "customerName": "Pooja"
  }'
```

---

## 📱 The Buyer Experience

When you redirect customers to `order.statusUrl`, PaidSure serves a fast, mobile-optimized checkout interface:

1. **Dynamic High-Contrast QR Code:** Point and scan with any bank or UPI app.
2. **One-Tap App Switchers:** Instant deep-links for:
   - 🔵 **Google Pay**
   - 🟣 **PhonePe**
   - 🔷 **Paytm**
   - 💳 **CRED & BHIM**
3. **Animated Real-Time Confirmation:**
   - Real-time live status transitions from an active verification spinner to a green drawing checkmark the instant the bank credit clears.

---

## 🛡️ Security Best Practices

* **Keep Secret Keys on the Backend:** Never expose your `psm_live_...` key in client-side HTML, React components, or public GitHub repositories.
* **Always Verify Webhook Signatures:** Use `paidsure.verifyWebhookSignature(...)` on incoming webhooks to ensure notifications originate from PaidSure and prevent forged requests.
* **Non-Custodial Rails:** PaidSure never holds customer funds; all transactions flow directly between the buyer's UPI app and your linked bank account.

---

## 📄 License

MIT License © PaidSure Team.
