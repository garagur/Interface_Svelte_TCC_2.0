<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  onMount(() => {
    const token = localStorage.getItem("token");
    const cargo = localStorage.getItem("cargo");

    if (!token || cargo !== "admin") {
      goto("/main");
    }
  });
</script>

<slot />
