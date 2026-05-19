<script>
  import { loginUser } from "../services/UserServices/LoginService.js";

  export let onLogin;

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
      onLogin?.(data);
    } catch (e) {
      erroLogin = e.message;
    } finally {
      carregando = false;
    }
  }
</script>

<div class="login-wrapper">
  <div class="card">
    <h2>Acesso ao Sistema</h2>
    <form on:submit|preventDefault={handleSubmit}>
      <div class="field">
        <label for="m">Matrícula</label>
        <input
          id="m"
          type="text"
          bind:value={loginMatricula}
          placeholder="000000"
          required
        />
      </div>
      <div class="field">
        <label for="s">Senha</label>
        <input
          id="s"
          type="password"
          bind:value={loginSenha}
          placeholder="******"
          required
        />
      </div>

      {#if erroLogin}
        <p class="erro">{erroLogin}</p>
      {/if}

      <button type="submit" class="btn-main" disabled={carregando}>
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    background: linear-gradient(135deg, #585858 0%, #1f1f1f 100%);
    background-attachment: fixed;
    min-height: 100vh;
  }

  :global(html, body) {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    min-height: 100vh !important;
  }

  :global(#app) {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
  }

  .login-wrapper {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    font-family: "Inter", sans-serif;
  }
  .card {
    background: #ffffff;
    padding: 2.5rem;
    border-radius: 24px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  h2 {
    color: rgb(51, 51, 51);
    text-align: center;
    margin-bottom: 1.5rem;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #64748b;
  }
  input {
    padding: 0.75rem;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    color: #1e293b;
    border-radius: 8px;
  }
  input:focus {
    outline: none;
    border-color: #464646;
    background: #fff;
  }
  .btn-main {
    background: #1f1f1f;
    color: white;
    border: none;
    padding: 0.8rem;
    border-radius: 12px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
  }
  .btn-main:hover {
    background: rgb(54, 54, 54);
  }
  .erro {
    color: #dc2626;
    margin: 0;
    font-size: 0.9rem;
    text-align: center;
  }
</style>
