<script lang="ts">
  import { Svroller } from '../../../../src/index'

  export let data: string[]
</script>

<div class="container">
  <Svroller width="20rem" height="20rem" alwaysVisible={true}>
    {#each data as d (d)}
      <div class="item">{d}</div>
    {/each}
  </Svroller>
</div>

<style>
  .container {
    width: 20rem;

    --svrollbar-track-width: 10px;
    --svrollbar-track-radius: 0;
    --svrollbar-track-background: lightgray;
    --svrollbar-track-opacity: 1;

    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-radius: 0;
    --svrollbar-thumb-background: gray;
    --svrollbar-thumb-opacity: 0.5;
  }

  .item {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
</style>
