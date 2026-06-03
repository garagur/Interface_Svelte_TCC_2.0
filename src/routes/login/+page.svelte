<script>
  import LoginCard from "$lib/components/login/LoginCard.svelte";
  import { loginUser } from "$lib/services/UserServices/Login_User_Service.js";
  import { goto } from "$app/navigation";
  import "$lib/styles/login.css";

  let loginMatricula = "";
  let loginSenha = "";
  let erroLogin = "";
  let carregando = false;

  async function handleSubmit() {
    erroLogin = "";
    carregando = true;
    try {
      const data = await loginUser(loginMatricula, loginSenha);
      localStorage.setItem("token", data.token);
      localStorage.setItem("matricula", data.user?.matricula || "");
      localStorage.setItem("cargo", data.user?.cargo || "");
      goto("/main");
    } catch (e) {
      erroLogin = e.message;
    } finally {
      carregando = false;
    }
  }
</script>

<svelte:head>
  <style>
    body {
      margin: 0;
      background: linear-gradient(135deg, #585858 0%, #1f1f1f 100%);
      background-attachment: fixed;
      min-height: 100vh;
    }
  </style>
</svelte:head>

<LoginCard
  bind:loginMatricula
  bind:loginSenha
  {erroLogin}
  {carregando}
  onSubmit={handleSubmit}
/>
