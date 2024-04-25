<svelte:head>
  <title>Authorize</title>
</svelte:head>

<div class="hero min-h-[60vh] flex flex-col justify-center items-center">
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
    <button class="btn btn-success mb-4 md:mb-0 md:mr-4 px-10 md:px-20"
      >Allow</button
    >
    <button class="btn btn-error px-10 md:px-20">Deny</button>
  </div>
</div>
