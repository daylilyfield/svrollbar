<script lang="ts">
  import { Svroller } from '../../../src/index'

  export let data: string[]
</script>

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
</style>

<div class="container">
  <Svroller width="20rem" height="20rem" alwaysVisible={true}>
    {#each data as d (d)}
      <div>{d}</div>
    {/each}
  </Svroller>
</div>
