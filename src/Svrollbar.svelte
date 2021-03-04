<script>
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

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
  export let visibilityTimeout = 1000

  let vTrack
  let vThumb

  $: wholeHeight = viewport?.scrollHeight ?? 0
  $: scrollTop = viewport?.scrollTop ?? 0
  $: trackHeight = viewport?.offsetHeight ?? 0
  $: thumbHeight = (trackHeight / wholeHeight) * trackHeight ?? 0
  $: thumbTop = (scrollTop / wholeHeight) * trackHeight ?? 0

  $: listened = viewport ? listen(viewport) : null
  $: observed = contents ? observe(contents) : null

  const opacity = tweened(0.0, {
    duration: 300,
    easing: cubicOut,
  })

  function listen(viewport) {
    listened?.()

    let timer = 0

    let startTop = 0
    let startY = 0

    const setupTimer = () => {
      timer = window.setTimeout(() => {
        opacity.set(0.0)
      }, visibilityTimeout)
    }

    const clearTimer = () => {
      if (timer) {
        window.clearTimeout(timer)
        timer = 0
      }
    }

    const onScroll = () => {
      clearTimer()
      setupTimer()

      opacity.set(1.0)

      scrollTop = viewport?.scrollTop ?? 0
    }

    const onTrackEnter = () => {
      clearTimer()
    }

    const onTrackLeave = () => {
      clearTimer()
      setupTimer()
    }

    const onThumbDown = (event) => {
      event.stopPropagation()
      event.preventDefault()

      startTop = viewport.scrollTop
      startY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY

      document.addEventListener('mousemove', onThumbMove)
      document.addEventListener('touchmove', onThumbMove)
      document.addEventListener('mouseup', onThumbUp)
      document.addEventListener('touchend', onThumbUp)
    }

    const onThumbMove = (event) => {
      event.stopPropagation()
      event.preventDefault()

      const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY
      const ratio = wholeHeight / trackHeight

      viewport.scrollTop = startTop + ratio * (clientY - startY)
    }

    const onThumbUp = (event) => {
      event.stopPropagation()
      event.preventDefault()

      startTop = 0
      startY = 0

      document.removeEventListener('mousemove', onThumbMove)
      document.removeEventListener('touchmove', onThumbMove)
      document.removeEventListener('mouseup', onThumbUp)
      document.removeEventListener('touchend', onThumbUp)
    }

    viewport.addEventListener('scroll', onScroll, { passive: true })

    vTrack.addEventListener('mouseenter', onTrackEnter)
    vTrack.addEventListener('mouseleave', onTrackLeave)

    vThumb.addEventListener('mousedown', onThumbDown)
    vThumb.addEventListener('touchstart', onThumbDown)

    return () => {
      viewport.removeEventListener('scroll', onScroll)

      vTrack.removeEventListener('mouseenter', onTrackEnter)
      vTrack.removeEventListener('mouseleave', onTrackLeave)
    }
  }

  function observe(contents) {
    observed?.()

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
</script>

<style>
  .v-track {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: var(--svrollbar-track-radius, initial);
    width: var(--svrollbar-track-width, 10px);
    opacity: var(--svrollbar-track-opacity, 0);
    background-color: var(--svrollbar-track-color, initial);
  }

  .v-thumb {
    position: relative;
    margin: 0 auto;
    border-radius: var(--svrollbar-thumb-radius, 0.25rem);
    width: var(--svrollbar-thumb-width, 6px);
    opacity: var(--svrollbar-thumb-opacity, 0.5);
    background-color: var(--svrollbar-thumb-color, #454545);
  }
</style>

<div bind:this={vTrack} class="v-track" style="height: {trackHeight}px; opacity: {$opacity}">
  <div bind:this={vThumb} class="v-thumb" style="height: {thumbHeight}px; top: {thumbTop}px" />
</div>
