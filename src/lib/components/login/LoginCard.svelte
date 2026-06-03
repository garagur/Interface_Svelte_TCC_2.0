<script>
    export let loginMatricula;
    export let loginSenha;
    export let erroLogin;
    export let carregando;
    export let onSubmit;
    import "$lib/styles/login.css";
</script>

<div class="login-wrapper">
    <div class="card">
        <h2>Acesso ao Sistema</h2>
        <form on:submit|preventDefault={onSubmit}>
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
    @import "$lib/styles/login.css";
</style>
