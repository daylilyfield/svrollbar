<script>
  import { fade } from 'svelte/transition'
  import { createEventDispatcher, onDestroy } from 'svelte'

  /**
   * @type {HTMLElement}
   */
  export let viewport

  /**
   * @type {HTMLElement}
   */
  export let contents

  /**
   * @type {number}
   */
  export let hideAfter = 1000

  /**
   * @type {boolean}
   */
  export let alwaysVisible = false

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

  /**
   * @event show
   * @event hide
   */
  const dispatch = createEventDispatcher()

  let vTrack
  let vThumb

  let startTop = 0
  let startY = 0
  let timer = 0
  let visible = alwaysVisible

  $: teardownViewport = setupViewport(viewport)
  $: teardownContents = setupContents(contents)
  $: teardownTrack = setupTrack(vTrack)
  $: teardownThumb = setupThumb(vThumb)

  $: wholeHeight = viewport?.scrollHeight ?? 0
  $: scrollTop = viewport?.scrollTop ?? 0
  $: trackHeight = viewport?.offsetHeight ?? 0
  $: thumbHeight = (trackHeight / wholeHeight) * trackHeight ?? 0
  $: thumbTop = (scrollTop / wholeHeight) * trackHeight ?? 0

  function setupViewport(viewport) {
    if (!viewport) return

    teardownViewport?.()

    viewport.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      viewport.removeEventListener('scroll', onScroll)
    }
  }

  function setupTrack(track) {
    if (!track) return

    teardownTrack?.()

    vTrack.addEventListener('mouseenter', onTrackEnter)
    vTrack.addEventListener('mouseleave', onTrackLeave)
    return () => {
      vTrack.removeEventListener('mouseenter', onTrackEnter)
      vTrack.removeEventListener('mouseleave', onTrackLeave)
    }
  }

  function setupThumb(thumb) {
    if (!thumb) return

    teardownThumb?.()

    vThumb.addEventListener('mousedown', onThumbDown)
    vThumb.addEventListener('touchstart', onThumbDown)

    return () => {
      vThumb.removeEventListener('mousedown', onThumbDown)
      vThumb.removeEventListener('touchstart', onThumbDown)
    }
  }

  function setupContents(contents) {
    if (!contents) return

    teardownContents?.()

    if (typeof window.ResizeObserver === 'undefined') {
      throw new Error('window.ResizeObserver is missing.')
    }

    const observer = new ResizeObserver((entries) => {
      for (const _entry of entries) {
        wholeHeight = viewport?.scrollHeight ?? 0
      }
    })

    observer.observe(contents)

    return () => {
      observer.unobserve(contents)
      observer.disconnect()
    }
  }

  function setupTimer() {
    timer = window.setTimeout(() => {
      visible = alwaysVisible || false
      dispatch('hide')
    }, hideAfter)
  }

  function clearTimer() {
    if (timer) {
      window.clearTimeout(timer)
      timer = 0
    }
  }

  function onScroll() {
    clearTimer()
    setupTimer()
    debugger
    visible = alwaysVisible || true
    scrollTop = viewport?.scrollTop ?? 0

    dispatch('show')
  }

  function onTrackEnter() {
    clearTimer()
  }

  function onTrackLeave() {
    clearTimer()
    setupTimer()
  }

  function onThumbDown(event) {
    event.stopPropagation()
    event.preventDefault()

    startTop = viewport.scrollTop
    startY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY

    document.addEventListener('mousemove', onThumbMove)
    document.addEventListener('touchmove', onThumbMove)
    document.addEventListener('mouseup', onThumbUp)
    document.addEventListener('touchend', onThumbUp)
  }

  function onThumbMove(event) {
    event.stopPropagation()
    event.preventDefault()

    const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY
    const ratio = wholeHeight / trackHeight

    viewport.scrollTop = startTop + ratio * (clientY - startY)
  }

  function onThumbUp(event) {
    event.stopPropagation()
    event.preventDefault()

    startTop = 0
    startY = 0

    document.removeEventListener('mousemove', onThumbMove)
    document.removeEventListener('touchmove', onThumbMove)
    document.removeEventListener('mouseup', onThumbUp)
    document.removeEventListener('touchend', onThumbUp)
  }

  onDestroy(() => {
    teardownViewport?.()
    teardownContents?.()
    teardownTrack?.()
    teardownThumb?.()
  })
</script>

<style>
  .v-scrollbar {
    position: absolute;
    top: 0;
    right: 0;
    width: var(--svrollbar-track-width, 10px);
  }

  .v-track {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: var(--svrollbar-track-radius, initial);
    width: var(--svrollbar-track-width, 10px);
    opacity: var(--svrollbar-track-opacity, 1);
    background: var(--svrollbar-track-background, initial);
    box-shadow: var(--svrollbar-track-shadow, initial);
  }

  .v-thumb {
    position: relative;
    margin: 0 auto;
    border-radius: var(--svrollbar-thumb-radius, 0.25rem);
    width: var(--svrollbar-thumb-width, 6px);
    opacity: var(--svrollbar-thumb-opacity, 0.5);
    background: var(--svrollbar-thumb-background, gray);
    box-shadow: var(--svrollbar-thumb-shadow, initial);
  }
</style>

{#if visible}
  <div class="v-scrollbar" style="height: {trackHeight}px">
    <div
      bind:this={vTrack}
      class="v-track"
      style="height: {trackHeight}px"
      in:vTrackIn
      out:vTrackOut />
    <div
      bind:this={vThumb}
      class="v-thumb"
      style="height: {thumbHeight}px; top: {thumbTop}px"
      in:vThumbIn
      out:vThumbOut />
  </div>
{/if}
