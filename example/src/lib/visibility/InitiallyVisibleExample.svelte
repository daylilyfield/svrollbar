<script lang="ts">
  import { Svroller } from '../../../../src/index'

  export let data: string[]

  let short = data.slice(0, 2)

  let scrollable = true
</script>

<div class="controls">
  <input id="initially-visible-scrollable" type="checkbox" bind:checked={scrollable} />
  <label for="initially-visible-scrollable">long contents</label>
</div>

<Svroller width="20rem" height="20rem" initiallyVisible>
  {#if scrollable}
    {#each data as d (d)}
      <div class="item">{d}</div>
    {/each}
  {:else}
    {#each short as d (d)}
      <div class="item">{d}</div>
    {/each}
  {/if}
</Svroller>

<style>
  .item {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }

  .controls {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    border-bottom: 1px solid #676778;
  }

  input {
    padding: 0.25rem 0.5rem;
  }

  label {
    padding: 0.25rem;
  }
</style>
