<script lang="ts">
  import { Svroller } from '../../../src/index'

  export let data: string[]
</script>

<Svroller width="20rem" height="20rem">
  {#each data as d (d)}
    <div>{d}</div>
  {/each}
</Svroller>
