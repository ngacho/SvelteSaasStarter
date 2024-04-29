<script lang="ts">
  import { sortedBlogPosts, blogInfo } from "./posts"
</script>

<svelte:head>
  <title>{blogInfo.name}</title>
  <meta name="description" content="Our blog posts." />
</svelte:head>

<div class="py-8 lg:py-12 px-6 max-w-3xl mx-auto">
  <div
    class="p-4 text-2xl lg:text-4xl font-medium text-primary flex gap-3 items-baseline text-center place-content-center"
  >
    <div class="text-center leading-relaxed font-bold text-primary-500">
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

  <div class="mx-auto place-content-center">
    {#each sortedBlogPosts as post}
      <a href={post.link}>
        <div class="p-2 text-xl underline">{post.title}</div>
      </a>
    {/each}
  </div>
</div>
