<script lang="ts">
  import { Svroller } from '../../src/index'

  const items = Array.from({ length: 50 }).map((_, i) => `item ${i}`)
</script>

<Svroller width="10rem" height="10rem">
  {#each items as item (item)}
    <div>{item}</div>
  {/each}
</Svroller>
