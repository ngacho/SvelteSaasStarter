import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({
  url,
  locals: { supabase, getSession },
}) => {
  const session = await getSession()

  // client id and client secret are stored in the session
  const client_id = url.searchParams.get("client_id")
  const response_type = url.searchParams.get("response_type")

  if (!session && response_type === "code" && client_id) {
    // redirect to login with client_id and response_type
    throw redirect(303, `/login/sign_in${url.search}`)
  }

  if (!session) {
    throw redirect(303, "/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(`*`)
    .eq("id", session.user.id)
    .single()

  return { session, profile }
}
