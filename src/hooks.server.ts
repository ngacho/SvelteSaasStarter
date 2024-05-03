// src/hooks.server.ts
import {
  PRIVATE_SUPABASE_URL,
  PRIVATE_SUPABASE_ANON_KEY,
} from "$env/static/private"
import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private"
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit"
import { createClient } from "@supabase/supabase-js"
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PRIVATE_SUPABASE_URL,
    supabaseKey: PRIVATE_SUPABASE_ANON_KEY,
    event,
  })

  event.locals.supabaseServiceRole = createClient(
    PRIVATE_SUPABASE_URL,
    PRIVATE_SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } },
  )

  /**
   * A convenience helper so we can just call await getSession() instead const { data: { session } } = await supabase.auth.getSession()
   */
  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    return session
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range"
    },
  })
}
