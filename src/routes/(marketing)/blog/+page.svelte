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
    <div class="text-center">
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

  <div class="text-left max-w-lg mx-auto">
    {#each sortedBlogPosts as post}
      <div class="py-1 sm:py-0.5">
        <a href={post.link}>
          <div class="text-xl underline">{post.title}</div>
        </a>
      </div>
    {/each}
  </div>
</div>
