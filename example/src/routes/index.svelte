<script lang="ts">
  import '../app.css'

  import { crossfade, fade, scale } from 'svelte/transition'
  import { onMount } from 'svelte'
  import Svrollbar from './../../../src/Svrollbar.svelte'
  import characters from '$lib/characters'
  import DefaultExample from '$lib/simple/DefaultExample.svelte'
  import AndroidLikeExample from '$lib/simple/AndroidLikeExample.svelte'
  import Example from '$lib/Example.svelte'
  import WindowsLikeExample from '$lib/simple/WindowsLikeExample.svelte'
  import ColoredExample from '$lib/style/ColoredExample.svelte'
  import GradationThumbExample from '$lib/style/GradationThumbExample.svelte'
  import GradationTrackExample from '$lib/style/GradationTrackExample.svelte'
  import FlyExample from '$lib/animation/FlyExample.svelte'
  import CrossfadeExample from '$lib/animation/CrossfadeExample.svelte'
  import ScaleExample from '$lib/animation/ScaleExample.svelte'
  import ExternalViewportExample from '$lib/other/ExternalViewportExample.svelte'
  import TinyVirtualListExample from '$lib/other/TinyVirtualListExample.svelte'
  import DynamicViewportExample from '$lib/resize/DynamicViewportExample.svelte'
  import DynamicSvrollerExample from '$lib/resize/DynamicSvrollerExample.svelte'
  import VisibilityToggleExample from '$lib/visibility/VisibilityToggleExample.svelte'
  import InitiallyVisibleExample from '$lib/visibility/InitiallyVisibleExample.svelte'
  import AlwaysVisibleExample from '$lib/visibility/AlwaysVisibleExample.svelte'

  const data = characters

  const [send, receive] = crossfade({
    duration: 300,
    fallback: scale,
  })

  let width = 0
  let height = 0

  const opt = { key: 'fab' }
  const vThumbIn = (node: HTMLElement) => receive(node, opt)
  const vThumbOut = (node: HTMLElement) => send(node, opt)

  let visible = true

  function onWindowResize() {
    if (window.matchMedia('(max-width:576px)').matches) {
      width = 18
      height = 4
    } else if (window.matchMedia('(max-width:768px)').matches) {
      width = 26
      height = 5
    } else if (window.matchMedia('(max-width:1200px)').matches) {
      width = 29
      height = 5.5
    } else {
      width = 33
      height = 6.5
    }
  }

  onMount(() => {
    onWindowResize()
  })
</script>

<svelte:window on:resize={onWindowResize} />

<main>
  <div class="svrollbar">
    <Svrollbar
      on:show={() => (visible = false)}
      on:hide={() => (visible = true)}
      margin={{ top: 8, bottom: 8, right: 8 }}
      hideAfter={1000}
      {vThumbIn}
      {vThumbOut} />
  </div>

  {#if visible}
    <a
      href="https://github.com/daylilyfield/svrollbar"
      class="github"
      target="_blank"
      in:receive={opt}
      out:send={opt}>
      <span in:fade={{ delay: 190, duration: 10 }} out:fade={{ duration: 10 }}>
        <img src="/svrollbar/GitHub-Mark-Light-120px-plus.png" alt="github logo" />
        View on GitHub
      </span>
    </a>
  {/if}

  <div class="hero">
    <h1>SVROLLBAR</h1>
    <div class="caption">simple custom scrollbar made by svelte</div>
    <div class="svrollbar" />
  </div>

  <div class="showcase">
    <section>
      <h2>Simple Examples</h2>
      <div class="examples">
        <Example name="macOS like scrollbar">
          <DefaultExample {data} />
        </Example>
        <Example name="Android OS like scrollbar">
          <AndroidLikeExample {data} />
        </Example>
        <Example name="Windows OS like scrollbar">
          <WindowsLikeExample {data} />
        </Example>
      </div>
    </section>

    <section>
      <h2>Style Example</h2>
      <div class="examples">
        <Example name="colored example">
          <ColoredExample {data} />
        </Example>
        <Example name="gradation track example">
          <GradationTrackExample {data} />
        </Example>
        <Example name="gradation thumb example">
          <GradationThumbExample {data} />
        </Example>
      </div>
    </section>

    <section>
      <h2>Transition Example</h2>
      <div class="examples">
        <Example name="crossfade transition example">
          <CrossfadeExample {data} />
        </Example>
        <Example name="fly transition example">
          <FlyExample {data} />
        </Example>
        <Example name="scale transition example">
          <ScaleExample {data} />
        </Example>
      </div>
    </section>

    <section>
      <h2>External Viewport Example</h2>
      <div class="examples">
        <Example name="external viewport example">
          <ExternalViewportExample {data} />
        </Example>
        <Example name="svelte-tiny-virtual-list example">
          <TinyVirtualListExample {data} />
        </Example>
        <Example name="" />
      </div>
    </section>

    <section>
      <h2>Dynamic Resize Example</h2>
      <div class="examples">
        <Example name="dynamic viewport height example">
          <DynamicViewportExample {data} />
        </Example>
        <Example name="dynamic svroller height example">
          <DynamicSvrollerExample {data} />
        </Example>
        <Example name="" />
      </div>
    </section>

    <section>
      <h2>Dynamic Visibility Example</h2>
      <div class="examples">
        <Example name="always visible example">
          <AlwaysVisibleExample {data} />
        </Example>
        <Example name="initially visible example">
          <InitiallyVisibleExample {data} />
        </Example>
        <Example name="visibility toggle example">
          <VisibilityToggleExample {data} />
        </Example>
      </div>
    </section>
  </div>
</main>

<footer>Copyright &copy; 2021-2022 daylilyfield</footer>

<style>
  .hero {
    color: #676778;
    background-color: white;
    display: grid;
    grid-template-areas:
      'h1 bar'
      'desc bar';
    grid-template-columns: auto 1fr;
  }

  h1 {
    grid-area: h1;
    font-size: 2.5rem;
  }

  .caption {
    grid-area: desc;
    font-size: 0.85rem;
  }

  .hero > .svrollbar {
    margin: 0 0 0 1rem;
    width: 10px;
    grid-area: bar;
    background: linear-gradient(45deg, #ec4f27, orange);
    border-radius: 0.25rem;
  }

  .showcase {
    min-width: 320px;
    margin: 0 15rem;
    background-color: #676778;
  }

  section {
    padding: 4rem 0;
  }

  h2 {
    color: white;
    font-size: 2rem;
  }

  .examples {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  footer {
    padding: 2rem 4rem;
    text-align: right;
    color: #676778;
  }

  .github {
    color: white;
    position: fixed;
    z-index: 20;
    top: 0.5rem;
    right: 0.5rem;
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(45deg, #ec4f27, orange);
  }

  .github img {
    width: 1.5rem;
    height: 1.5rem;
  }

  @media screen and (min-width: 0px) {
    .hero {
      margin: 6rem 2rem;
    }
    .showcase {
      margin: 2rem 0 0 0;
      padding: 0 2rem;
    }
    .examples {
      justify-content: space-around;
    }
  }

  @media screen and (min-width: 576px) {
    .hero {
      margin: 6rem 2rem;
    }
    h1 {
      font-size: 3rem;
    }
    .caption {
      font-size: 1rem;
    }
    .showcase {
      margin: 2rem 0 0 0;
      padding: 0 2rem;
    }
  }

  @media screen and (min-width: 768px) {
    .hero {
      margin: 6rem 2rem;
    }
    h1 {
      font-size: 3.25rem;
    }
    .caption {
      font-size: 1.25rem;
    }
    .showcase {
      margin: 2rem 0 0 0;
      padding: 0 2rem;
    }
    .examples {
      justify-content: start;
    }
  }

  @media screen and (min-width: 992px) {
    .hero {
      margin: 6rem 2rem;
    }
    .showcase {
      margin: 2rem 0 0 0;
      padding: 0 2rem;
    }
  }

  @media screen and (min-width: 1200px) {
    .hero {
      margin: 10rem 4rem;
    }
    h1 {
      font-size: 4rem;
    }
    .caption {
      font-size: 1.5rem;
    }
    .showcase {
      margin: 4rem 0 0 0;
      padding: 0 4rem;
    }
    .examples {
      justify-content: space-between;
    }
  }

  @media screen and (min-width: 1400px) {
    .hero {
      margin: 10rem;
    }
    .showcase {
      margin: 10rem 0 0 0;
      padding: 0 10rem;
    }
    .examples {
      justify-content: space-between;
    }
  }

  :global(html, body) {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  :global(html::-webkit-scrollbar, body::-webkit-scrollbar) {
    /* hide scrollbar */
    display: none;
  }

  .svrollbar {
    --svrollbar-thumb-width: 6px;
    --svrollbar-thumb-background: linear-gradient(45deg, #ec4f27, orange);
    --svrollbar-thumb-opacity: 0.8;
  }
</style>
