<script lang="ts">
  import { fly } from 'svelte/transition'
  import { Svroller } from '../../../src/index'

  export let data: string[]

  const flyLeft = (node: HTMLElement) => fly(node, { x: -160 })
  const flyRight = (node: HTMLElement) => fly(node, { x: 30 })
</script>

<style>
  .container {
    --svrollbar-track-width: 20px;
    --svrollbar-track-background: #ec4f27;
    --svrollbar-track-opacity: 1;

    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-background: orange;
    --svrollbar-thumb-opacity: 1;
  }
</style>

<div class="container">
  <Svroller
    width="20rem"
    height="20rem"
    hideAfter={500}
    vTrackIn={flyLeft}
    vTrackOut={flyLeft}
    vThumbIn={flyRight}
    vThumbOut={flyRight}>
    {#each data as d (d)}
      <div>{d}</div>
    {/each}
  </Svroller>
</div>
