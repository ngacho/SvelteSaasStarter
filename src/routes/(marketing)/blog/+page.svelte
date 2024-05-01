<script lang="ts">
  import { sortedBlogPosts, blogInfo } from "./posts"
</script>

<svelte:head>
  <title>{blogInfo.name}</title>
  <meta name="description" content="Our blog posts." />
</svelte:head>

<div class="py-8 lg:py-12 px-6 max-w-2xl mx-auto">
  <div
    class="text-2xl lg:text-4xl font-medium text-primary flex gap-3 items-baseline text-center place-content-center"
  >
    <div class="text-centerfont-semibold">
      {blogInfo.name}
    </div>
    <a href="/blog/rss.xml" target="_blank" rel="noreferrer">
      <img
        class="flex-none w-5 h-5 object-contain"
        src="/images/rss.svg"
        alt="rss feed"
      />
    </a>
  </div>

  {#each sortedBlogPosts as post}
    <div class="my-4 sm:my-2">
      <a href={post.link}>
        <div class="text-xl underline">{post.title}</div>
      </a>
    </div>
  {/each}
</div>
