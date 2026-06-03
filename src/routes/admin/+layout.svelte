<script>
  import { onMount } from "svelte";

  onMount(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");

    if (!token || isAdmin !== "true") {
      window.location.href = "/main";
    }
  });
</script>

<slot />
