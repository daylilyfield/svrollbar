<script lang="ts">
  import { crossfade, scale } from 'svelte/transition'
  import { Svroller } from '../../../src/index'

  export let data: string[]

  const [send, receive] = crossfade({
    duration: 300,
    fallback: scale,
  })

  const opt = { key: 'fab' }

  const vThumbIn = (node: HTMLElement) => receive(node, opt)
  const vThumbOut = (node: HTMLElement) => send(node, opt)

  let visible = true
</script>

<style>
  .container {
    position: relative;
    --svrollbar-track-width: 12px;

    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-background: #ec4f27;
    --svrollbar-thumb-opacity: 1;
    --svrollbar-thumb-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
  }

  .fab {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: #ec4f27;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    margin: 0;
    color: white;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
  }

  .item {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
</style>

<div class="container">
  <Svroller
    width="20rem"
    height="20rem"
    hideAfter={500}
    on:show={() => (visible = false)}
    on:hide={() => (visible = true)}
    {vThumbIn}
    {vThumbOut}>
    {#each data as d (d)}
      <div class="item">{d}</div>
    {/each}
  </Svroller>
  {#if visible}
    <button class="fab" in:receive={opt} out:send={opt}>+</button>
  {/if}
</div>
