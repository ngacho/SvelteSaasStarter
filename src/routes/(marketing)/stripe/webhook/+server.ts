import { STRIPE_WEBHOOK_SECRET } from "$env/static/private"
import type Stripe from "stripe"
import type { RequestEvent } from "./$types"
import { deletePriceRecord, deleteProductRecord, manageSubscriptionStatusChange, stripe, upsertPriceRecord, upsertProductRecord } from "./stripe-helpers"
import { error } from "@sveltejs/kit"

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "product.deleted",
  "price.created",
  "price.updated",
  "price.deleted",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
])

export async function POST({ request }: RequestEvent) {
  // stripe webhook endpoint
  const body = await request.text()
  const sig = request.headers.get("stripe-signature") || ""
  const webhookSecret = STRIPE_WEBHOOK_SECRET || ""
  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) {
      return { status: 401, body: "Unauthorized" }
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    console.log(`🔔  Webhook received: ${event.type}`)
  } catch (error: any) {
    console.log(`❌ Error message: ${error.message}`)
    return { status: 400, body: `Webhook Error: ${error.message}` }
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "product.created":
        case "product.updated":
          await upsertProductRecord(event.data.object as Stripe.Product)
          break
        case "price.created":
        case "price.updated":
          await upsertPriceRecord(event.data.object as Stripe.Price)
          break
        case "price.deleted":
          await deletePriceRecord(event.data.object as Stripe.Price)
          break
        case "product.deleted":
          await deleteProductRecord(event.data.object as Stripe.Product)
          break
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === "customer.subscription.created",
          )
          break
        case "checkout.session.completed":
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true,
            )
          }
          break
        default:
          error(500, "Unhandled relevant event!")
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        body: "Webhook handler failed. View your Next.js function logs.",
      }
    }
  } else {
    return { status: 500, body: `Unsupported event type: ${event.type}` }
  }
  return { status: 200, body: "Webhook received successfully!" }
}
