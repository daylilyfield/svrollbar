<script lang="ts">
  import { Svroller } from '../../src/index'

  const items = Array.from({ length: 50 }).map((_, i) => `item ${i}`)
</script>

<style>
  .container {
    border: 3px solid #5d7150;
    width: 10rem;

    --svrollbar-track-width: 20px;
    --svrollbar-track-color: #85b4b9;
    --svrollbar-thumb-opacity: 0;

    --svrollbar-thumb-width: 10px;
    --svrollbar-thumb-color: #d9ab55;
    --svrollbar-thumb-opacity: 1;
  }
</style>

<div class="container">
  <Svroller width="10rem" height="10rem">
    {#each items as item (item)}
      <div>{item}</div>
    {/each}
  </Svroller>
</div>
