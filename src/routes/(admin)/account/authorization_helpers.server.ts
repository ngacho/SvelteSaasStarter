import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "../../../DatabaseDefinitions"

export const fetchAuthClient = async ({
  clientId,
  supabaseServiceRole,
}: {
  clientId: string
  supabaseServiceRole: SupabaseClient<Database>
}) => {
  let authorized_apps
  try {
    const { data: authClient, error } = await supabaseServiceRole
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
