<script lang="ts">
  import { Svroller } from '../../../../src/index'

  export let data: string[]

  let visible = false
</script>

<div class="controls">
  <input id="check" type="checkbox" bind:checked={visible} />
  <label for="check">visible</label>
</div>

<Svroller width="20rem" height="20rem" alwaysVisible={visible}>
  {#each data as d (d)}
    <div class="item">{d}</div>
  {/each}
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
