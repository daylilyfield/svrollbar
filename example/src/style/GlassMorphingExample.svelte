<script lang="ts">
  import { Svroller } from '../../../src/index'

  export let data: string[]
</script>

<style>
  .container {
    --svrollbar-track-width: 20px;
    --svrollbar-thumb-background: linear-gradient(45deg, #ec4f27, orange);
    --svrollbar-track-opacity: 1;

    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-background: orange;
    --svrollbar-thumb-opacity: 1;

    @apply bg-gray-50;
    @apply border-gray-50;
    @apply bg-opacity-30;
    @apply border-opacity-30;
    @apply border-t;
    @apply border-l;
    @apply bd-blur;
    @apply shadow-lg;
    @apply z-10;

    .bd-blur {
      backdrop-filter: blur(8px);
    }
  }
</style>

<div class="container">
  <Svroller width="20rem" height="20rem" hideAfter={100000}>
    {#each data as d (d)}
      <div>{d}</div>
    {/each}
  </Svroller>
</div>
