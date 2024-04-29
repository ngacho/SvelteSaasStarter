import { redirect, error } from "@sveltejs/kit"
import {
  getOrCreateCustomerId,
  fetchSubscription,
} from "../../subscription_helpers.server"
import type { PageServerLoad } from "./$types"
import { PRIVATE_STRIPE_API_KEY } from "$env/static/private"
import Stripe from "stripe"
const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" })


export const load: PageServerLoad = async ({
  locals: { getSession, supabaseServiceRole },
  cookies,
}) => {
  const session = await getSession()
  if (!session) {
    console.log("🔒 /account/billing/: No session found")
    throw redirect(303, "/login")
  }

  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    session,
  })
  if (idError || !customerId) {
    console.log(
      `🔒 /account/billing/: Error getting or creating customer ID error: ${JSON.stringify(idError)}, ${customerId}`,
    )
    throw error(500, {
      message: "Unknown error. If issue persists, please contact us.",
    })
  }

  const {
    stripe_subscription_id,
    primarySubscription,
    hasEverHadSubscription,
    error: fetchErr,
  } = await fetchSubscription({
    customerId,
  })
  if (fetchErr) {
    console.log(
      `🔒 /account/billing/: Error fetching subscription: ${fetchErr}`,
    )
    throw error(500, {
      message: "Unknown error. If issue persists, please contact us.",
    })
  }

  // console.log("🔒 /account/billing/: primarySubscription", primarySubscription)
  if (stripe_subscription_id) {
    cookies.set("subscription_id", stripe_subscription_id, {
      path: "/account/billing",
      sameSite: true,
    })
  }

  return {
    isActiveCustomer: !!primarySubscription,
    hasEverHadSubscription,
    currentPlanId: primarySubscription?.appSubscription?.id,
  }
}

/** @type {import('./$types').Actions} */
export const actions: import("./$types").Actions = {
  default: async ({ request, cookies }) => {
    // retrieve subscription id
    const subscription_id = cookies.get("subscription_id")
    if (!subscription_id) {
      console.log("🔒 /account/billing/: No subscription id found")
      return { error: "Subscription id not found" }
    }

    const subscription = await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true,
    })
  },
}
