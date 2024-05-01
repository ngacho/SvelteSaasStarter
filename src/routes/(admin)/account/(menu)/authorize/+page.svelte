<script>
  import { onMount } from "svelte"

  /** @type {import('./$types').PageData} */
  export let data

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
  <div class="hero min-h-[60vh] flex flex-col justify-center items-center">
    <h1 class="text-3xl font-semibold text-center">Redirecting...</h1>
  </div>
{/if}

<svelte:head>
  <title>Authorize</title>
</svelte:head>

{#if data.isActiveCustomer && !form}
  <div class="hero min-h-[60vh] flex flex-col justify-center items-center">
    <form method="POST">
      <div
        class="max-w-3xl text-3xl font-semibold text-center"
        style="line-height: 1.2;"
      >
        {data.authClientName} is requesting your payment information
      </div>
      <div class="m-6 md:mt-10 text-lg md:text-lg text-center">
        <p class="mt-5 max-w-prose text-zinc-700 sm:text-2xl">
          Authorize {data.authClientName} to access your user and/or payment information?
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
{:else if form && form.body?.error}
  <div>
    <div class="hero min-h-[60vh] flex flex-col justify-center items-center">
      <h1 class="text-3xl font-semibold text-center">An error occured : {form?.body?.error}</h1>
    </div>
  </div>
{/if}
