<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import "$lib/styles/admin-cadastro.css";
  onMount(() => {
    const token = localStorage.getItem("token");
    const cargo = localStorage.getItem("cargo");

    if (!token || cargo !== "admin") {
      goto("/main");
      return;
    }
  });
</script>

<div class="escopo-admin-cadastro">
  <slot />
</div>
