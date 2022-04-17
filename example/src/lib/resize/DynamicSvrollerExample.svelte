<script lang="ts">
  import { Svroller } from '../../../../src/index'

  export let data: string[]

  let height = 20
</script>

<div class="buttons">
  <button on:click={() => height++}>+</button>
  <button on:click={() => height--}>-</button>
</div>

<Svroller width="20rem" height="{height}rem">
  {#each data as d (d)}
    <div class="item">{d}</div>
  {/each}
</Svroller>

<style>
  .item {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    border-bottom: 1px solid #676778;
  }

  button {
    padding: 0.25rem 0.5rem;
  }
</style>
