<script lang="ts">
  import { Svroller } from '../../../src/index'

  export let data: string[]
</script>

<style>
  .item {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
</style>

<Svroller width="20rem" height="20rem">
  {#each data as d (d)}
    <div class="item">{d}</div>
  {/each}
</Svroller>
