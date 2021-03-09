<script lang="ts">
  import { scale } from 'svelte/transition'
  import { Svroller } from '../../../src/index'

  export let data: string[]

  const grow = (node: HTMLElement) => scale(node)
</script>

<style>
  .container {
    --svrollbar-track-width: 20px;

    --svrollbar-thumb-width: 20px;
    --svrollbar-thumb-background: #ec4f27;
    --svrollbar-thumb-opacity: 1;
  }
</style>

<div class="container">
  <Svroller width="20rem" height="20rem" hideAfter={500} vThumbIn={grow} vThumbOut={grow}>
    {#each data as d (d)}
      <div>{d}</div>
    {/each}
  </Svroller>
</div>
