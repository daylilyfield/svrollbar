<script>
  import ExternalViewportExample from './ExternalViewportExample.svelte'
  import SimpleExample from './SimpleExample.svelte'
  import StyledExample from './StyledExample.svelte'
  import EmptyExample from './EmptyExample.svelte'
  import TinyVirtualListExample from './TinyVirtualListExample.svelte'
</script>

<style>
  main {
    padding: 2rem;
  }
</style>

<main>
  <h1>Svrollbar & Svroller Example</h1>

  <section>
    <h2>Simple Example</h2>
    <SimpleExample />
  </section>

  <section>
    <h2>Styled Example</h2>
    <StyledExample />
  </section>

  <section>
    <h2>External Viewport Example</h2>
    <ExternalViewportExample />
  </section>

  <section>
    <h2>
      <a href="https://github.com/Skayo/svelte-tiny-virtual-list">svelte-tiny-virtual-list</a> Example
    </h2>
    <TinyVirtualListExample />
  </section>

  <section>
    <h2>Empty Example</h2>
    <EmptyExample />
  </section>
</main>
