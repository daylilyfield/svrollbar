<script lang="ts">
  import { onMount } from 'svelte'
  import VirtualList from 'svelte-tiny-virtual-list'
  import { Svrollbar } from '../../src'

  const items = Array.from({ length: 50 }).map((_, i) => `item ${i}`)

  let viewport: HTMLElement
  let contents: HTMLElement

  onMount(() => {
    viewport = document.querySelector('.virtual-list-wrapper')
    contents = document.querySelector('.virtual-list-inner')
  })
</script>

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
    width: 10rem;
  }
</style>

<div class="wrapper">
  <Svrollbar {viewport} {contents} />
  <VirtualList width="10rem" height={160} itemCount={items.length} itemSize={16}>
    <div slot="item" let:index let:style {style}>
      {items[index]}
    </div>
  </VirtualList>
</div>
