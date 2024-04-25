<script>
  import "../../app.css"
  export const currYear = new Date().getFullYear()
</script>

<div class="navbar bg-base-100 container mx-auto">
  <div class="flex-1">
    <a
      href="/"
      class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
    >
      <img
        src="/images/email-digest-logo.png"
        class="h-8"
        alt="Flowbite Logo"
      />
      <span class="self-center text-2xl font-semibold">Email Digest </span>
    </a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1 hidden sm:flex font-bold text-lg">
      <li class="md:mx-2"><a href="/blog">Blog</a></li>
      <li class="md:mx-2"><a href="/pricing">Pricing</a></li>
      <li class="md:mx-2"><a href="/account">Account</a></li>
    </ul>
    <div class="dropdown dropdown-end sm:hidden">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <label tabindex="0" class="btn btn-ghost btn-circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h7"
          /></svg
        >
      </label>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <ul
        tabindex="0"
        class="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 font-bold"
      >
        <li><a href="/blog">Blog</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/account">Account</a></li>
        <li>
          <a
            href="https://github.com/CriticalMoments/CMSaasStarter"
            class="border border-primary">★ us on Github</a
          >
        </li>
      </ul>
    </div>
  </div>
</div>

<div class="">
  <slot />
</div>

<!-- Spacer grows so the footer can be at bottom on short pages -->
<div class="flex-grow"></div>

<div class="mt-10">
  <footer class="">
    <div class="w-full max-w-screen-xl mx-auto p-4 md:py-8">
      <div class="sm:flex sm:items-center sm:justify-between">
        <a
          href="/"
          class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
        >
          <img
            src="/images/email-digest-logo.png"
            class="h-8"
            alt="Flowbite Logo"
          />
          <span class="self-center text-2xl font-semibold">Email Digest </span>
        </a>
        <ul
          class="flex flex-wrap items-center mb-6 text-sm font-medium text-primary-500 sm:mb-0 dark:text-primary-400"
        >
          <li>
            <a href="/" class="hover:underline me-4 md:me-6">About</a>
          </li>
          <li>
            <a href="/" class="hover:underline me-4 md:me-6">Privacy Policy</a>
          </li>
          <li>
            <a href="/" class="hover:underline me-4 md:me-6">Licensing</a>
          </li>
          <li>
            <a href="/" class="hover:underline">Contact</a>
          </li>
        </ul>
      </div>
      <hr
        class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8"
      />
      <span
        class="block text-sm text-primary-500 sm:text-center dark:text-primary-400"
        >© {currYear} <a href="/" class="hover:underline">Email Digest</a>. All
        Rights Reserved.</span
      >
    </div>
  </footer>
</div>
