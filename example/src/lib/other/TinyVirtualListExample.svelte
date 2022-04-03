<script lang="ts">
  import { onMount } from 'svelte'
  import VirtualList from 'svelte-tiny-virtual-list'
  import { Svrollbar } from '../../../../src/index'

  export let data: string[]

  let viewport: HTMLElement
  let contents: HTMLElement

  onMount(() => {
    viewport = document.querySelector('.virtual-list-wrapper')
    contents = document.querySelector('.virtual-list-inner')
  })
</script>

<div class="wrapper">
  <Svrollbar {viewport} {contents} />
  <VirtualList width="20rem" height={320} itemCount={data.length} itemSize={22}>
    <div slot="item" class="item" let:index let:style {style}>
      {data[index]}
    </div>
  </VirtualList>
</div>

<style>
  :global(.virtual-list-wrapper) {
    /* hide scrollbar */
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }

  :global(.virtual-list-wrapper::-webkit-scrollbar) {
    /* hide scrollbar */
    display: none !important;
  }

  .wrapper {
    position: relative;
  }

  .item {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
</style>
