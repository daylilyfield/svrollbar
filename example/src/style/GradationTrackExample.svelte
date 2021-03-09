<script lang="ts">
  import { Svroller } from '../../../src/index'

  export let data: string[]
</script>

<style>
  .container {
    --svrollbar-track-width: 10px;
    --svrollbar-track-background: linear-gradient(45deg, #ec4f27, orange);
    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-radius: 0;
    --svrollbar-thumb-background: white;
    --svrollbar-thumb-opacity: 0.5;
  }
</style>

<div class="container">
  <Svroller width="20rem" height="20rem">
    {#each data as d (d)}
      <div>{d}</div>
    {/each}
  </Svroller>
</div>
