"""
Python (FastAPI) Store Example with PaidSure
"""
import hmac
import hashlib
import requests
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

PAIDSURE_API_KEY = "psm_live_sample_key_here"
PAIDSURE_URL = "http://localhost:4000"
WEBHOOK_SECRET = "psw_sec_sample_secret"

@app.post("/buy")
def create_checkout():
    payload = {
        "amount": 999,  # ₹999
        "note": "Premium Course Subscription",
        "customerName": "Rohan",
    }
    headers = {
        "Authorization": f"Bearer {PAIDSURE_API_KEY}",
        "Content-Type": "application/json"
    }
    res = requests.post(f"{PAIDSURE_URL}/api/orders", json=payload, headers=headers)
    if res.status_code != 201:
        raise HTTPException(status_code=500, detail="Failed to create order")
    
    order = res.json()["order"]
    # Redirect customer to order["statusUrl"]
    return {"checkoutUrl": order["statusUrl"]}

@app.post("/webhook")
async def paidsure_webhook(request: Request):
    signature = request.headers.get("x-paidsure-signature")
    body = await request.body()
    
    expected = hmac.new(WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature or "", expected):
        raise HTTPException(status_code=401, detail="Invalid signature")

    data = await request.json()
    if data.get("event") == "order.paid":
        order_ref = data["order"]["ref"]
        utr = data["payment"]["utr"]
        print(f"Verified payment for {order_ref} with bank UTR: {utr}")

    return {"ok": True}
