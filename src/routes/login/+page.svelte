<script>
  import LoginCard from "$lib/components/login/LoginCard.svelte";
  import {
    sendOtp,
    loginUser,
  } from "$lib/services/UserServices/Login_User_Service.js";
  import { goto } from "$app/navigation";

  let email = "";
  let otp = "";
  let erro = "";
  let carregando = false;
  let etapa = 1;

  async function handleSubmitEmail() {
    erro = "";
    carregando = true;
    try {
      await sendOtp(email);
      etapa = 2;
    } catch (e) {
      erro = e.message;
    } finally {
      carregando = false;
    }
  }

  async function handleSubmitOtp() {
    erro = "";
    carregando = true;
    try {
      const data = await loginUser(email, otp);
      localStorage.setItem("token", data.token);
      localStorage.setItem("cargo", data.user?.cargo || "");
      localStorage.setItem("user_id", data.user?.id || "");
      goto("/main");
    } catch (e) {
      erro = e.message;
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
  bind:email
  bind:otp
  {erro}
  {carregando}
  {etapa}
  onSubmitEmail={handleSubmitEmail}
  onSubmitOtp={handleSubmitOtp}
/>
