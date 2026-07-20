import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      // Match sustainable-website Stripe SDK pin.
      apiVersion: "2026-03-25.dahlia" as Stripe.LatestApiVersion,
    });
  }
  return stripeClient;
}

export function getAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
}
