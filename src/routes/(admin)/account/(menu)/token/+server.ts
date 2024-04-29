import { json } from "@sveltejs/kit"
import type { RequestEvent } from "./$types"
import { createAccessToken } from "../../authorization_helpers.server"

function validateTokenRequest(authCodeRequest: TokenRequest) {
  for (let key in authCodeRequest) {
    if (authCodeRequest[key] === "") {
      console.log(`Parameter ${key} is empty.`)
      return false
    }
  }
  return true
}

export async function POST({ request }: RequestEvent) {
  // Parse the request body as JSON
  try {
    const requestBody = await request.text()
    // Split the query string into key-value pairs
    const bodyParams = requestBody.split("&")
    // Initialize an empty object to store the token request parameters
    const tokenRequest = {} as TokenRequest
    // Iterate over the key-value pairs and populate the token request object
    for (const param of bodyParams) {
      const [key, value] = param.split("=")
      tokenRequest[key] = value
    }

    if (!validateTokenRequest(tokenRequest) || !tokenRequest.code) {
      console.log("Token request is invalid.")
      return json(
        {
          error: "Token request is invalid.",
        },
        { status: 400 },
      )
    }

    // get access token
    const {
      error: authCodeError,
      accessToken,
      accessTokenExpiry,
      refreshToken,
      refreshTokenExpiry,
    } = await createAccessToken({
      authCode: tokenRequest.code,
    })

    if (authCodeError || !accessToken) {
      console.log("Error creating access token:", authCodeError)
      return json(
        {
          error: "Error creating access token.",
        },
        { status: 400 },
      )
    }

    return json(
      {
        access_token: accessToken,
        access_token_expiry: accessTokenExpiry,
        refresh_token: refreshToken,
        refresh_token_expiry: refreshTokenExpiry,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error parsing request body:", error)
    return json(
      {
        error: "Error parsing request body.",
      },
      { status: 400 },
    )
  }
}
