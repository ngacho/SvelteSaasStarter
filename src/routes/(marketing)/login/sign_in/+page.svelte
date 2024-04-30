<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte"
  import { sharedAppearance, oauthProviders } from "../login_config"
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { page } from "$app/stores"

  export let data
  let { supabase } = data
  export let pageSearchParams = $page.url.search
  let responseTypePresent =
    $page.url.searchParams.get("response_type") === "code"

  onMount(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      // Redirect to account after sucessful login
      if (event == "SIGNED_IN") {

        // Delay needed because order of callback not guaranteed.
        // Give the layout callback priority to update state or
        // we'll just bounch back to login when /account tries to load
        if (responseTypePresent) {
          // set cookie

          setTimeout(() => {
            goto(
              `${data.url}/account/authorize${$page.url.search}&sign_in_state=${session?.user.id}`,
            )
          }, 1)
        } else {
          setTimeout(() => {
            goto(`${data.url}/account`)
          }, 1)
        }
      }
    })
  })
</script>

<svelte:head>
  <title>Sign in</title>
</svelte:head>

{#if $page.url.searchParams.get("verified") == "true"}
  <div role="alert" class="alert alert-success mb-5">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      /></svg
    >
    <span>Email verified! Please sign in.</span>
  </div>
{/if}
<!-- if response type is code -->
{#if $page.url.searchParams.get("response_type") == "code"}
  <h1 class="text-2xl font-bold mb-6">Sign In</h1>
  <p>Redirected for auth</p>
  <Auth
    supabaseClient={data.supabase}
    view="sign_in"
    redirectTo={`${data.url}/account/authorize${pageSearchParams}`}
    providers={oauthProviders}
    socialLayout="horizontal"
    showLinks={false}
    appearance={sharedAppearance}
    additionalData={undefined}
  />
  <div class="text-l text-slate-800 mt-4">
    <a class="underline" href="/login/forgot_password">Forgot password?</a>
  </div>
  <div class="text-l text-slate-800 mt-3">
    Don't have an account? <a class="underline" href="/login/sign_up">Sign up</a
    >.
  </div>
{:else}
  <h1 class="text-2xl font-bold mb-6">Sign In</h1>
  <Auth
    supabaseClient={data.supabase}
    view="sign_in"
    redirectTo={`${data.url}/auth/callback`}
    providers={oauthProviders}
    socialLayout="horizontal"
    showLinks={false}
    appearance={sharedAppearance}
    additionalData={undefined}
  />
  <div class="text-l text-slate-800 mt-4">
    <a class="underline" href="/login/forgot_password">Forgot password?</a>
  </div>
  <div class="text-l text-slate-800 mt-3">
    Don't have an account? <a class="underline" href="/login/sign_up">Sign up</a
    >.
  </div>
{/if}
