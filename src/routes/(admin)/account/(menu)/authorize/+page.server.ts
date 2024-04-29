import { error, redirect } from "@sveltejs/kit"
import {
  fetchSubscription,
  getOrCreateCustomerId,
} from "../../subscription_helpers.server"
import type { PageServerLoad } from "../$types"

export const load: PageServerLoad = async ({
  locals: { getSession, supabaseServiceRole },
}) => {
  const session = await getSession()
  if (!session) {
    // fix this redirect so we come back here after login.
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

  return {
    isActiveCustomer: !!primarySubscription,
    hasEverHadSubscription,
    currentPlanId: primarySubscription?.appSubscription?.id,
  }
}

/** @type {import('./$types').Actions} */
export const actions: import("./$types").Actions = {
  default: async ({ request }) => {
    const requestUrl = request.url
    console.log("requestUrl:", requestUrl)

    const url = new URL(requestUrl)
    const searchParams = url.searchParams
    // construct authcode request object
    let authcodeRequest: AuthcodeRequestUrlParams = {
      response_type: searchParams.get("response_type") ?? "",
      client_id: searchParams.get("client_id") ?? "",
      client_secret: searchParams.get("client_secret") ?? "",
      redirect_uri: searchParams.get("redirect_uri") ?? "",
      state: searchParams.get("state") ?? "",
      scope: searchParams.get("scope") ?? "",
    }

    const authCodeResponse: AuthcodeResponse = {
      status: 200,
      body: {
        access_token: "mkqFqiIcStUViurQOCvWqU",
        token_type: "Bearer",
        expires_in: 3600,
        authCodeRequest: authcodeRequest,
      },
    }

    return authCodeResponse
  },
}