<script>
  import { fade } from 'svelte/transition'
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  import { createEventDispatcher } from 'svelte'

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
   * @type {(node: HTMLElement, params: any) => svelte.TransitionConfig}
   */
  export let transitionIn = (node) => fade(node, { duration: 100 })
  /**
   * @type {(node: HTMLElement, params: any) => svelte.TransitionConfig}
   */
  export let transitionOut = (node) => fade(node, { duration: 300 })

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
  let visible = false

  $: teardownViewport = setupViewport(viewport)
  $: teardownContents = setupContents(contents)
  $: teardownTrack = setupTrack(vTrack)
  $: teardownThumb = setupThumb(vThumb)

  $: wholeHeight = viewport?.scrollHeight ?? 0
  $: scrollTop = viewport?.scrollTop ?? 0
  $: trackHeight = viewport?.offsetHeight ?? 0
  $: thumbHeight = (trackHeight / wholeHeight) * trackHeight ?? 0
  $: thumbTop = (scrollTop / wholeHeight) * trackHeight ?? 0

  const opacity = tweened(0.0, {
    duration: 300,
    easing: cubicOut,
  })

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
      opacity.set(0.0)
      visible = false
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

    opacity.set(1.0)
    visible = true
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
</script>

<style>
  .v-track {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: var(--svrollbar-track-radius, initial);
    width: var(--svrollbar-track-width, 10px);
    opacity: var(--svrollbar-track-opacity, 1);
    background-color: var(--svrollbar-track-background, initial);
  }

  .v-thumb {
    position: relative;
    margin: 0 auto;
    border-radius: var(--svrollbar-thumb-radius, 0.25rem);
    width: var(--svrollbar-thumb-width, 6px);
    opacity: var(--svrollbar-thumb-opacity, 0.5);
    background-color: var(--svrollbar-thumb-background, gray);
  }
</style>

{#if visible}
  <div
    bind:this={vTrack}
    class="v-track"
    style="height: {trackHeight}px"
    in:transitionIn
    out:transitionOut>
    <div bind:this={vThumb} class="v-thumb" style="height: {thumbHeight}px; top: {thumbTop}px" />
  </div>
{/if}
