<script lang="ts">
  import { Svrollbar } from '../../../../src/index'

  export let data: string[]

  let viewport: HTMLElement
  let contents: HTMLElement

  let height = 20
</script>

<div class="buttons">
  <button on:click={() => height++}>+</button>
  <button on:click={() => height--}>-</button>
</div>

<div class="wrapper">
  <div bind:this={viewport} class="viewport" style="height: {height}rem">
    <div bind:this={contents} class="contents">
      {#each data as d (d)}
        <div class="item">{d}</div>
      {/each}
    </div>
  </div>
  <Svrollbar {viewport} {contents} />
</div>

<style>
  .wrapper {
    position: relative;
  }

  .viewport {
    position: relative;
    width: 20rem;
    overflow: scroll;
    box-sizing: border-box;

    /* hide scrollbar */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .viewport::-webkit-scrollbar {
    /* hide scrollbar */
    display: none;
  }

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
