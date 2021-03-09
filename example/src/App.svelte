<script lang="ts">
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
  import Svroller from '../../src/Svroller.svelte'

  const data = characters
</script>

<style>
  .hero {
    color: #676778;
    background-color: white;

    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-background: linear-gradient(45deg, #ec4f27, orange);
    --svrollbar-thumb-opacity: 1;
  }

  h1 {
    font-size: 3.75rem;
  }

  .showcase {
    min-width: 480px;
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
    top: 0.5rem;
    right: 0.5rem;
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(45deg, #ec4f27, orange);
  }

  .github > img {
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
    .showcase {
      margin: 2rem 0 0 0;
      padding: 0 2rem;
    }
  }

  @media screen and (min-width: 768px) {
    .hero {
      margin: 6rem 2rem;
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
</style>

<main>
  <button class="github">
    <img src="./assets/GitHub-Mark-Light-120px-plus.png" alt="github logo" />
    View on GitHub
  </button>

  <div class="hero">
    <Svroller width="26rem" height="6rem" alwaysVisible={true}>
      <h1>SVROLLBAR</h1>
      <div>simple custom scrollbar made by svelte</div>
    </Svroller>
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
  </div>
</main>

<footer>Copyright &copy; 2021 daylilyfield</footer>
