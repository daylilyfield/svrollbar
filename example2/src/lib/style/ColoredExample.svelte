<script lang="ts">
  import { Svroller } from '../../../../src/index'

  export let data: string[]
</script>

<div class="container">
  <Svroller width="20rem" height="20rem">
    {#each data as d (d)}
      <div class="item">{d}</div>
    {/each}
  </Svroller>
</div>

<style>
  .container {
    --svrollbar-track-width: 20px;
    --svrollbar-track-background: #ec4f27;
    --svrollbar-track-opacity: 1;

    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-background: orange;
    --svrollbar-thumb-opacity: 1;
  }

  .item {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
</style>
