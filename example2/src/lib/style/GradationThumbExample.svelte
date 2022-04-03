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
    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-background: linear-gradient(45deg, #ec4f27, orange);
    --svrollbar-thumb-opacity: 1;
  }

  .item {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
</style>
