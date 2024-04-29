import { redirect, error } from "@sveltejs/kit"
import { getOrCreateCustomerId } from "../../../subscription_helpers.server"
import type { PageServerLoad } from "./$types"
import { PRIVATE_STRIPE_API_KEY } from "$env/static/private"
import Stripe from "stripe"
const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" })

export const load: PageServerLoad = async ({
  url,
  locals: { getSession, supabaseServiceRole },
}) => {
  const session = await getSession()
  if (!session) {
    console.log("🔒 /account/billing/manage/: No session found")
    throw redirect(303, "/login")
  }

  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    session,
  })
  if (idError || !customerId) {
    console.log(`🔒 /account/billing/manage/: Error getting or creating customer ID eror: ${idError}, ${customerId}`)
    throw error(500, {
      message: "Unknown error (PCID). If issue persists, please contact us.",
    })
  }

  let portalLink
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${url.origin}/account/billing`,
    })
    portalLink = portalSession?.url
  } catch (e) {
    console.log(`🔒 /account/billing/manage/: Error creating billing portal session: ${e}`)

    throw error(
      500,
      "Unknown error (PSE). If issue persists, please contact us.",
    )


  }

  throw redirect(303, portalLink ?? "/account/billing")
}
