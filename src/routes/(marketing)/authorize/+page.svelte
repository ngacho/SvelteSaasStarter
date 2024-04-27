<script>
  import { onMount } from "svelte"

  /** @type {import('./$types').ActionData} */
  export let form

  // Check if the form response status is 200 and redirect if true
  // Redirect function to be called on client-side
  function redirectToUri() {
    if (form?.status === 200 && form?.body.authCodeRequest?.redirect_uri) {
      window.location.href =
        form.body.authCodeRequest.redirect_uri +
        `?success=1&response_type=${form.body.authCodeRequest.response_type}&state=${form.body.authCodeRequest.state}&code=${form.body.access_token}`
    }
  }

  // Call redirectToUri function after component mounts (on the client side)
  onMount(redirectToUri)
</script>

{#if form?.status === 200}
  <p>Redirecting...</p>
{/if}

<svelte:head>
  <title>Authorize</title>
</svelte:head>

<div class="hero min-h-[60vh] flex flex-col justify-center items-center">
  <form method="POST">
    <div
      class="max-w-3xl text-3xl font-semibold text-center"
      style="line-height: 1.2;"
    >
      Email Digest Add On is requesting your payment information
    </div>
    <div class="m-6 md:mt-10 text-lg md:text-lg text-center">
      <p class="mt-5 max-w-prose text-zinc-700 sm:text-2xl">
        Authorize Email Digest Add On to access your user and/or payment
        information?
      </p>
    </div>
    <div class="flex flex-col lg:items-stretch md:flex-row justify-center">
      <button
        class="btn btn-success mb-4 md:mb-0 md:mr-4 px-10 md:px-20"
        type="submit">Allow</button
      >
      <button class="btn btn-error px-10 md:px-20" type="button">Deny</button>
    </div>
  </form>
</div>
