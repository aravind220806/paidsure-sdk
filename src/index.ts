import { createHmac, timingSafeEqual } from "node:crypto";

export interface PaidSureOptions {
  /** Your secret merchant API key: psm_live_... */
  apiKey: string;
  /** Optional webhook secret for signature verification: psw_sec_... */
  webhookSecret?: string;
  /** Custom gateway base URL (defaults to production or local gateway) */
  baseUrl?: string;
}

export interface CreateOrderParams {
  /** Whole rupees amount to charge, e.g. 499 */
  amount: number;
  /** Order note / item description shown on the customer's UPI app */
  note?: string;
  /** Customer's name */
  customerName?: string;
}

export interface OrderResponse {
  ref: string;
  amount: string;
  amountPaise: number;
  baseAmountPaise: number;
  extraPaise: number;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  intentUrl: string;
  statusUrl: string;
  expiresAt: string;
}

export interface OrderStatusDetails {
  ref: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  amount: string;
  amountPaise: number;
  paidAt: string | null;
  utr: string | null;
  confirmedSource: string | null;
}

export class PaidSure {
  private readonly apiKey: string;
  private readonly webhookSecret?: string;
  private readonly baseUrl: string;

  constructor(options: PaidSureOptions) {
    if (!options.apiKey || !options.apiKey.startsWith("psm_")) {
      throw new Error("Invalid PaidSure API Key. Must start with 'psm_'");
    }
    this.apiKey = options.apiKey;
    this.webhookSecret = options.webhookSecret;
    this.baseUrl = (options.baseUrl || "https://paid-sure.vercel.app").replace(/\/+$/, "");
  }

  /**
   * Create a new fingerprinted UPI checkout order.
   * Redirect the customer to `order.statusUrl` or use `order.intentUrl`.
   */
  async createOrder(params: CreateOrderParams): Promise<OrderResponse> {
    if (!params.amount || params.amount < 1) {
      throw new Error("Amount must be at least ₹1");
    }

    const response = await fetch(`${this.baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    });

    const data = (await response.json()) as any;
    if (!response.ok) {
      throw new Error(data.error || `Failed to create order: HTTP ${response.status}`);
    }

    return data.order as OrderResponse;
  }

  /**
   * Check the live status of an order.
   */
  async getOrder(orderRef: string): Promise<OrderStatusDetails> {
    const response = await fetch(`${this.baseUrl}/api/orders/${encodeURIComponent(orderRef)}`);
    const data = (await response.json()) as any;

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch order: HTTP ${response.status}`);
    }

    return data.order as OrderStatusDetails;
  }

  /**
   * Verify an incoming webhook from PaidSure (`order.paid`).
   * Protects your server from forged payment notifications.
   */
  verifyWebhookSignature(payload: string | object, signature: string): boolean {
    if (!this.webhookSecret) {
      throw new Error("webhookSecret is required to verify signatures");
    }

    const bodyString = typeof payload === "string" ? payload : JSON.stringify(payload);
    const expected = createHmac("sha256", this.webhookSecret).update(bodyString).digest("hex");

    try {
      return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
    } catch {
      return false;
    }
  }
}

export default PaidSure;
