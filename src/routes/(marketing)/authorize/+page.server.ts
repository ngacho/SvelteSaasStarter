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
