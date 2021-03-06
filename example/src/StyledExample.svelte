<script lang="ts">
  import { fly } from 'svelte/transition'
  import { Svroller } from '../../src/index'

  const items = Array.from({ length: 50 }).map((_, i) => `item ${i}`)
  const flyLeft = (node: HTMLElement) => fly(node, { x: -160 })
  const flyRight = (node: HTMLElement) => fly(node, { x: 30 })
</script>

<style>
  .container {
    border: 3px solid #5d7150;
    width: 10rem;

    --svrollbar-track-width: 20px;
    --svrollbar-track-background: #85b4b9;
    --svrollbar-track-opacity: 1;

    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-background: #d9ab55;
    --svrollbar-thumb-opacity: 1;
  }
</style>

<div class="container">
  <Svroller
    width="10rem"
    height="10rem"
    hideAfter={1000}
    vTrackIn={flyLeft}
    vTrackOut={flyLeft}
    vThumbIn={flyRight}
    vThumbOut={flyRight}>
    {#each items as item (item)}
      <div>{item}</div>
    {/each}
  </Svroller>
</div>
