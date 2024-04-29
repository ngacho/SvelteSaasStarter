import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "../$types"

export const actions = {
  signout: async ({ locals: { supabase, getSession } }) => {
    const session = await getSession()
    if (session) {
      await supabase.auth.signOut()
      throw redirect(303, "/")
    }
  },
}


export const load: LayoutServerLoad = async () => {
  // redirect /account to /account/settings
  throw redirect(303, "/account/settings")
}
