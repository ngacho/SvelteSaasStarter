<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte"
  import { sharedAppearance, oauthProviders } from "../login_config"
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"

  export let data
  let { supabase } = data

  onMount(() => {
    supabase.auth.onAuthStateChange((event: string, session: any) => {
      // Redirect to account after sucessful login
      if (event == "SIGNED_IN") {
        setTimeout(() => {
          goto(`${data.url}/account/`)
        }, 1)
      }
    })
  })
</script>

<svelte:head>
  <title>Sign up</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Sign Up</h1>
<Auth
  supabaseClient={data.supabase}
  view="sign_up"
  redirectTo={`${data.url}/login/sign_in`}
  showLinks={false}
  providers={oauthProviders}
  socialLayout="horizontal"
  appearance={sharedAppearance}
  additionalData={undefined}
/>
<div class="text-l text-slate-800 mt-4 mb-2">
  Have an account? <a class="underline" href="/login/sign_in">Sign in</a>.
</div>
