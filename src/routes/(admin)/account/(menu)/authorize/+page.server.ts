import { error, redirect } from "@sveltejs/kit"
import {
  fetchSubscription,
  getOrCreateCustomerId,
} from "../../subscription_helpers.server"
import type { PageServerLoad } from "../$types"
import {
  createAuthCodes,
  fetchAuthClient,
} from "../../authorization_helpers.server"

function validateAuthcodeRequest(authCodeRequest: AuthcodeRequestUrlParams) {
  for (let key in authCodeRequest) {
    if (authCodeRequest[key] === "") {
      console.log(`Parameter ${key} is empty.`)
      return false
    }
  }
  return true
}

export const load: PageServerLoad = async ({
  locals: { getSession, supabaseServiceRole },
  url,
  cookies,
}) => {
  const session = await getSession()
  if (!session) {
    // fix this redirect so we come back here after login.
    console.log("🔒 /account/billing/: No session found")
    // will be clutch for login redirect
    // const loginPath = `/login${url.search}`
    // console.log(loginPath)
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

  const searchParams = new URL(url).searchParams
  const auth_client_id = searchParams.get("client_id")

  if (!auth_client_id) {
    console.log(
      `🔒 /account/billing/: Missing client_id or client_secret in query params`,
    )
    throw error(400, {
      message: "Missing client_id or client_secret in query params",
    })
  }

  const fetchAuthClientResponse = await fetchAuthClient({
    clientId: auth_client_id,
  })

  const { authClientName, error: authError } = fetchAuthClientResponse || {}

  if (authError || !authClientName) {
    console.log(
      `🔒 /account/billing/: Error fetching auth client name: ${authError}`,
    )
    throw error(500, {
      message: "Error fetching auth client: Invalid client_id",
    })
  }

  cookies.set("user_id", session.user.id, {
    path: "/account/authorize",
    sameSite: true,
  })

  return {
    isActiveCustomer: !!primarySubscription,
    hasEverHadSubscription,
    currentPlanId: primarySubscription?.appSubscription?.id,
    authClientName,
  }
}

/** @type {import('./$types').Actions} */
export const actions: import("./$types").Actions = {
  default: async ({ request, cookies }) => {
    const requestUrl = request.url
    console.log("requestUrl:", requestUrl)

    const url = new URL(requestUrl)
    const searchParams = url.searchParams
    // construct authcode request object
    let authcodeRequest: AuthcodeRequestUrlParams = {
      response_type: searchParams.get("response_type") ?? "",
      client_id: searchParams.get("client_id") ?? "",
      redirect_uri: searchParams.get("redirect_uri") ?? "",
      state: searchParams.get("state") ?? "",
      scope: searchParams.get("scope") ?? "",
    }

    if (!validateAuthcodeRequest(authcodeRequest)) {
      return {
        status: 400,
        body: {
          access_token: "",
          token_type: "Bearer",
          expires_in: 0,
          authCodeRequest: authcodeRequest,
          error: "Invalid Auth Code Request. Missing parameters.",
        },
      }
    }

    // create access token cuz of session present.
    const user_id = cookies.get("user_id") ?? url.searchParams.get("user_id");
    console.log("user_id:", user_id)

    if(!user_id) {
    
      return {
        status: 400,
        body: {
          access_token: "",
          token_type: "Bearer",
          expires_in: 0,
          authCodeRequest: authcodeRequest,
          error: "No user id found",
        },
      
      }
    }
    const { error: authCodeError, authCode } = await createAuthCodes({
      userId: user_id,
      clientId: authcodeRequest.client_id,
    })

    if (authCodeError || !authCode) {
      return {
        status: 400,
        body: {
          access_token: "",
          token_type: "Bearer",
          expires_in: 5 * 60,
          authCodeRequest: authcodeRequest,
          error: authCodeError?.message || "Error generating access token",
        },
      }
    }
    // delete the cookie after the access token generation
    cookies.delete("user_id", { path: "/account/authorize", sameSite: true })

    const authCodeResponse: AuthcodeResponse = {
      status: 200,
      body: {
        access_token: authCode,
        token_type: "Bearer",
        expires_in: 3600,
        authCodeRequest: authcodeRequest,
      },
    }

    return authCodeResponse
  },
}
