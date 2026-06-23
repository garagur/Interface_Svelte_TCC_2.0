<script>
    export let email;
    export let otp;
    export let erro;
    export let carregando;
    export let etapa;
    export let onSubmitEmail;
    export let onSubmitOtp;
    export let avisoSessao = "";
</script>

<div class="login-wrapper">
    <div class="card">
        <h2>Acesso ao Sistema</h2>

        {#if etapa === 1}
            <form on:submit|preventDefault={onSubmitEmail}>
                <div class="field">
                    <label for="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        bind:value={email}
                        placeholder="seu@email.com"
                        required
                    />
                </div>

                {#if avisoSessao}
                    <p class="aviso-sessao">{avisoSessao}</p>
                {/if}

                <button type="submit" class="btn-main" disabled={carregando}>
                    {carregando ? "Verificando..." : "Verificar usuário"}
                </button>
            </form>
        {:else}
            <p class="info">Código enviado para <strong>{email}</strong></p>
            <form on:submit|preventDefault={onSubmitOtp}>
                <div class="field">
                    <label for="otp">Código de acesso</label>
                    <input
                        id="otp"
                        type="text"
                        bind:value={otp}
                        placeholder="000000"
                        maxlength="6"
                        required
                    />
                </div>

                {#if erro}
                    <p class="erro">{erro}</p>
                {/if}

                <button type="submit" class="btn-main" disabled={carregando}>
                    {carregando ? "Entrando..." : "Entrar"}
                </button>
            </form>
        {/if}
    </div>
</div>
