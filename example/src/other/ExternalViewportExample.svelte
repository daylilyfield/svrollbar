<script lang="ts">
  import { Svrollbar } from '../../../src/index'

  export let data: string[]

  export let viewport: HTMLElement
  export let contents: HTMLElement
</script>

<style>
  .wrapper {
    position: relative;
  }

  .viewport {
    position: relative;
    width: 20rem;
    height: 20rem;
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
</style>

<div class="wrapper">
  <div bind:this={viewport} class="viewport">
    <div bind:this={contents} class="contents">
      {#each data as d (d)}
        <div class="item">{d}</div>
      {/each}
    </div>
  </div>
  <Svrollbar {viewport} {contents} />
</div>
