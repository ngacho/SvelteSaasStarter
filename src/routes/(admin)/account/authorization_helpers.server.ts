import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "../../../DatabaseDefinitions"
import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private"
import { PUBLIC_SUPABASE_URL } from "$env/static/public"
import cryptoRandomString from "crypto-random-string"

const supabaseAdmin = createClient(
  PUBLIC_SUPABASE_URL,
  PRIVATE_SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } },
)

export const fetchAuthClient = async ({ clientId }: { clientId: string }) => {
  try {
    const { data: authClient, error } = await supabaseAdmin
      .from("auth_clients")
      .select("*")
      .eq("client_id", clientId)
      .single()

    if (error && error.code != "PGRST116") {
      // PGRST116 == no rows
      return { error: error }
    }

    if (authClient) {
      return { authClientName: authClient.auth_app_name }
    }
  } catch (e) {
    console.log("Error fetching auth client:", e)
    return { error: e }
  }
}

export const createAuthCodes = async ({
  userId,
  clientId,
}: {
  userId: string
  clientId: string
}) => {
  const accessCode = cryptoRandomString({ length: 32, type: "url-safe" })
  // we need to return the auth_code

  // add to authcodes table

  const { error: insertError } = await supabaseAdmin.from("auth_codes").insert([
    {
      fk_auth_client_id: clientId,
      created_at: new Date(),
      auth_code: accessCode,
      auth_code_expiry: new Date(new Date().getTime() + 5 * 60000),
      fk_user_id: userId,
    },
  ])

  if (insertError) {
    console.log(
      "authorization_helpers.server.createAuthCodes(): Error inserting auth code:",
      JSON.stringify(insertError),
    )
    return { error: insertError }
  }

  return { authCode: accessCode }
}

export const createAccessToken = async ({ authCode }: { authCode: string }) => {
  const now = new Date()
  // check if authcode exists, and if it's not expired.

  // 2-second delay to prevent authcode from being used when its not in db
  await new Promise((resolve) => setTimeout(resolve, 2000))

  let { data: auth_codes, error: authCodeError } = await supabaseAdmin
    .from("auth_codes")
    .select("auth_code,auth_code_expiry, fk_user_id")
    .eq("auth_code", authCode)

  if (authCodeError) {
    console.log(
      "authorization_helpers.server.createAccessToken(): Error fetching auth code:",
      authCodeError,
    )
    return { error: authCodeError }
  }

  if (!auth_codes || auth_codes.length === 0) {
    console.log(
      "authorization_helpers.server.createAccessToken(): No auth code found.",
    )
    return { error: "No auth code found." }
  }

  const authCodeObject = auth_codes[0]
  if (new Date(authCodeObject.auth_code_expiry) < now) {
    console.log(
      "authorization_helpers.server.createAuthCodes(): Auth code expired.",
    )
    return { error: "Auth code expired." }
  }

  // check if user is paid
  let { data: subscriptions, error: subscriptionError } = await supabaseAdmin
    .from("subscriptions")
    .select("current_period_end,trial_end")
    .eq("user_id", authCodeObject.fk_user_id)

  if (subscriptionError) {
    console.log(
      "authorization_helpers.server.createAuthCodes(): Error fetching subscription:",
      subscriptionError,
    )
    return { error: subscriptionError }
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log(
      "authorization_helpers.server.createAuthCodes(): No subscription found.",
    )
    return { error: "No subscription found." }
  }

  const subscription = subscriptions[0]
  // if either current_period_end or trial_end is greater than today, user is paid
  const today = new Date()
  const currentPeriodEnd =
    new Date(subscription.current_period_end) ||
    new Date(subscription.trial_end)
  if (today > currentPeriodEnd) {
    console.log(
      "authorization_helpers.server.createAuthCodes(): User is not paid.",
    )
    return { error: "User is not paid." }
  }

  // return access token
  const accessToken = cryptoRandomString({ length: 64, type: "url-safe" })
  const refreshToken = cryptoRandomString({ length: 64, type: "url-safe" })
  const refreshTokenExpiry = new Date(currentPeriodEnd)
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7)

  // created_at, access_token, access_token_expiry, refresh_token, refresh_token_expiry, user_id
  const { error: insertError } = await supabaseAdmin
    .from("access_tokens")
    .insert([
      {
        access_token: accessToken,
        access_token_expiry: currentPeriodEnd,
        refresh_token: refreshToken,
        refresh_token_expiry: refreshTokenExpiry,
        user_id: authCodeObject.fk_user_id,
        created_at: new Date(),
      },
    ])

  if (insertError?.message.includes("No auth code found")) {
    console.log(
      "authorization_helpers.server.createAuthCodes(): Error inserting access token:",
      insertError,
    )
    return { error: insertError }
  }

  return {
    accessToken: accessToken,
    accessTokenExpiry: currentPeriodEnd,
    refreshToken: refreshToken,
    refreshTokenExpiry: refreshTokenExpiry,
  }
}
