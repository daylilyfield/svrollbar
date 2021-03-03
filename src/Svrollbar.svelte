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

    const onScroll = () => {
      if (timer) {
        window.clearTimeout(timer)
        timer = 0
      }

      opacity.set(1.0)
      scrollTop = viewport?.scrollTop ?? 0
    }

    const onMouseLeave = () => {
      timer = window.setTimeout(() => {
        opacity.set(0.0)
      }, 1000)
    }

    viewport.addEventListener('scroll', onScroll, { passive: true })
    viewport.addEventListener('mouseleave', onMouseLeave)

    return () => {
      viewport.removeEventListener('scroll', onScroll)
      viewport.removeEventListener('mouseleave', onMouseLeave)
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
    width: var(--svrollbar-track-width, 8px);
    opacity: var(--svrollbar-track-opacity, 0);
    background-color: var(--svrollbar-track-color, initial);
  }

  .v-thumb {
    position: relative;
    margin: 0 auto;
    border-radius: 0.25rem;
    width: var(--svrollbar-thumb-width, 8px);
    opacity: var(--svrollbar-thumb-opacity, 0.5);
    background-color: var(--svrollbar-thumb-color, #454545);
  }
</style>

<div class="v-track" style="height: {trackHeight}px; opacity: {$opacity}">
  <div class="v-thumb" style="height: {thumbHeight}px; top: {thumbTop}px" />
</div>
