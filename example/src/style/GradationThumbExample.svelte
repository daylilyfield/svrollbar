<script lang="ts">
  import { Svroller } from '../../../src/index'

  export let data: string[]
</script>

<style>
  .container {
    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-background: linear-gradient(45deg, #ec4f27, yellow);
    --svrollbar-thumb-opacity: 1;
  }
</style>

<div class="container">
  <Svroller width="20rem" height="20rem">
    {#each data as d (d)}
      <div>{d}</div>
    {/each}
  </Svroller>
</div>
