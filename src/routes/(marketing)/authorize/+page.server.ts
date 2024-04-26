import { fail, redirect } from "@sveltejs/kit"

/** @type {import('./$types').Actions} */
export const actions: import("./$types").Actions = {
  default: async ({ request }) => {
    const requestUrl = request.url
    console.log("requestUrl: ", requestUrl)

    // redirect(
    //   302,
    //   "https://script.google.com/macros/d/1-UaD1EK9gCjMafh6PkwS0kft3gzlp_d5eNNjejZietnSidAN_4eQr4bk/usercallback",
    // )

    return {
      status: 200,
      body: {
        access_token: "1234567890",
        token_type: "Bearer",
        expires_in: 3600,
      },
    }
  },
}
