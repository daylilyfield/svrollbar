<script lang="ts">
  export let name: string
</script>

<style>
  .example {
    margin: 1rem 1rem 0 1rem;
  }

  .name {
    color: white;
  }

  .view {
    width: 20rem;
    background-color: white;
    margin-top: 1rem;
    border-radius: 0.25rem;
  }
</style>

<div class="example">
  <div class="name">{name}</div>
  <div class="view">
    <slot />
  </div>
</div>
