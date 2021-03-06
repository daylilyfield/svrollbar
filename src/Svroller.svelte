<script>
  import { fade } from 'svelte/transition'
  import Svrollbar from './Svrollbar.svelte'

  export let width = '10rem'
  export let height = '10rem'
  export let hideAfter = 1000

  /**
   * @type {(node: HTMLElement, params: any) => svelte.TransitionConfig}
   */
  export let vTrackIn = (node) => fade(node, { duration: 100 })
  /**
   * @type {(node: HTMLElement, params: any) => svelte.TransitionConfig}
   */
  export let vTrackOut = (node) => fade(node, { duration: 300 })

  /**
   * @type {(node: HTMLElement, params: any) => svelte.TransitionConfig}
   */
  export let vThumbIn = (node) => fade(node, { duration: 100 })
  /**
   * @type {(node: HTMLElement, params: any) => svelte.TransitionConfig}
   */
  export let vThumbOut = (node) => fade(node, { duration: 300 })

  let viewport
  let contents
</script>

<style>
  .wrapper {
    position: relative;
  }

  .viewport {
    position: relative;
    overflow: scroll;
    box-sizing: border-box;

    /* hide scrollbar */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .viewport::-webkit-scrollbar {
    /* hide scrollbar */
    display: none;
  }
</style>

<div class="wrapper" style="width: {width}">
  <div bind:this={viewport} class="viewport" style="width: {width}; height: {height}">
    <div bind:this={contents} class="contents">
      <slot />
    </div>
  </div>
  <Svrollbar
    {viewport}
    {contents}
    {hideAfter}
    {vTrackIn}
    {vTrackOut}
    {vThumbIn}
    {vThumbOut}
    on:show
    on:hide />
</div>
