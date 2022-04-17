<script>
  import { fade } from 'svelte/transition'
  import Svrollbar from './Svrollbar.svelte'

  export let width = '10rem'
  export let height = '10rem'

  export let hideAfter = 1000

  /**
   * @type {boolean}
   */
  export let alwaysVisible = false

  /**
   * @type {boolean}
   */
  export let initiallyVisible = false

  /**
   * margin (px) from viewport top, right, bottom and left.
   *
   * @type {{ top?: number, right?: number, buttom?: number, left?: number }}
   */
  export let margin = {}

  /**
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vTrackIn = (node) => fade(node, { duration: 100 })
  /**
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vTrackOut = (node) => fade(node, { duration: 300 })

  /**
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vThumbIn = (node) => fade(node, { duration: 100 })
  /**
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vThumbOut = (node) => fade(node, { duration: 300 })

  let viewport
  let contents
</script>

<div class="svlr-wrapper" style="width: {width}; height: {height}">
  <div bind:this={viewport} class="svlr-viewport" style="width: {width}; height: {height}">
    <div bind:this={contents} class="svlr-contents">
      <slot />
    </div>
  </div>
  <Svrollbar
    {viewport}
    {contents}
    {hideAfter}
    {alwaysVisible}
    {initiallyVisible}
    {margin}
    {vTrackIn}
    {vTrackOut}
    {vThumbIn}
    {vThumbOut}
    on:show
    on:hide />
</div>

<style>
  .svlr-wrapper {
    position: relative;
  }

  .svlr-viewport {
    position: relative;
    overflow: scroll;
    box-sizing: border-box;

    /* hide scrollbar */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .svlr-viewport::-webkit-scrollbar {
    /* hide scrollbar */
    display: none;
  }
</style>
