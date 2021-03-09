<script>
  import EmptyExample from './EmptyExample.svelte'
  import characters from './characters'
  import DefaultExample from './simple/DefaultExample.svelte'
  import AndroidLikeExample from './simple/AndroidLikeExample.svelte'
  import Example from './Example.svelte'
  import WindowsLikeExample from './simple/WindowsLikeExample.svelte'
  import ColoredExample from './style/ColoredExample.svelte'
  import GradationThumbExample from './style/GradationThumbExample.svelte'
  import GradationTrackExample from './style/GradationTrackExample.svelte'
  import FlyExample from './animation/FlyExample.svelte'
  import CrossfadeExample from './animation/CrossfadeExample.svelte'
  import ScaleExample from './animation/ScaleExample.svelte'
  import ExternalViewportExample from './other/ExternalViewportExample.svelte'
  import TinyVirtualListExample from './other/TinyVirtualListExample.svelte'

  const data = characters
</script>

<style>
  main {
    padding: 2rem;
    background-color: whitesmoke;
  }

  h1 {
  }

  h2 {
    margin-top: 1rem;
  }

  section > div {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
  }
</style>

<main>
  <h1>Svrollbar & Svroller Example</h1>

  <section>
    <h2>Simple Example</h2>
    <div>
      <Example>
        <DefaultExample {data} />
      </Example>
      <Example>
        <AndroidLikeExample {data} />
      </Example>
      <Example>
        <WindowsLikeExample {data} />
      </Example>
    </div>
  </section>

  <section>
    <h2>Style Example</h2>
    <div>
      <Example>
        <ColoredExample {data} />
      </Example>
      <Example>
        <GradationThumbExample {data} />
      </Example>
      <Example>
        <GradationTrackExample {data} />
      </Example>
    </div>
  </section>

  <section>
    <h2>Animation Example</h2>
    <div>
      <Example>
        <FlyExample {data} />
      </Example>
      <Example>
        <CrossfadeExample {data} />
      </Example>
      <Example>
        <ScaleExample {data} />
      </Example>
    </div>
  </section>

  <section>
    <h2>External Viewport Example</h2>
    <div>
      <Example>
        <ExternalViewportExample {data} />
      </Example>
      <Example>
        <TinyVirtualListExample {data} />
      </Example>
    </div>
  </section>
</main>
