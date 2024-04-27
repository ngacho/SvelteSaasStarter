import { json } from "@sveltejs/kit"
import type { RequestEvent } from "./$types"

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

    console.log("requestBody:", tokenRequest.code)
    // Access and process request parameters...
  } catch (error) {
    console.error("Error parsing request body:", error)
    // Handle parsing error...
  }
  // const body = await request.json()
  // console.log("request:", body)

  const authTokenResponse: any = {
    access_token: "rukKwFGMlYNAXSOSFwtjYvvlkJcPClnm",
    access_token_expiry: "2024-05-01T12:00:00Z",
    refresh_token: "iVkspAtjqhpFcBNRKfThBKEUoRrRcFtL",
    refresh_token_expiry: "2024-05-01T12:00:00Z",
  }

  return json(
    {
      access_token: "rukKwFGMlYNAXSOSFwtjYvvlkJcPClnm",
      access_token_expiry: "2024-05-01T12:00:00Z",
      refresh_token: "iVkspAtjqhpFcBNRKfThBKEUoRrRcFtL",
      refresh_token_expiry: "2024-05-01T12:00:00Z",
    },
    { status: 200 },
  )
}
