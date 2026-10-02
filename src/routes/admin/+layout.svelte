<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import CabecalhoGlobal from "$lib/components/main/CabecalhoGlobal.svelte";
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

<CabecalhoGlobal titulo="Portal de Agendamento" />

<div class="escopo-admin-cadastro">
  <slot />
</div>
