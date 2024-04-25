<script lang="ts">
  import { WebsiteName } from "./../../config"
</script>

<svelte:head>
  <title>{WebsiteName}</title>
  <meta name="description" content="{WebsiteName} Home Page" />
</svelte:head>

<div class="hero min-h-[20vh]">
  <div class="hero-content text-center pt-12">
    <div class="max-w-xxl">
      <div
        class="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl"
        style="line-height: 1.2;"
      >
        <span
          class="underline decoration-secondary decoration-4 md:decoration-[6px]"
          >Never</span
        >
        read your emails again
      </div>
      <div class="mt-6 md:mt-10 text-sm md:text-lg">
        <p class="mt-5 max-w-prose text-lg text-zinc-700 sm:text-2xl">
          Transform your inbox chaos to calendar clarity with a single click.
        </p>
      </div>

      <div class="mt-6 md:mt-10 text-sm md:text-lg">
        <a href="https://github.com/CriticalMoments/CMSaasStarter">
          <button
            class="btn btn-primary btn-sm px-6 h-11 rounded-md px-8 text-large"
            >Stop reading your emails</button
          >
        </a>
      </div>
    </div>
  </div>
</div>

<div class="hero min-h-60vh">
  <div class="m-6 md:mt-10 h-auto">
    <img
      class="h-auto max-w-5xl"
      src="/images/email-digest-ui.png"
      alt="SVG showing email digest UI"
    />
  </div>
</div>
