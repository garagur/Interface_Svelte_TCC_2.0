<script>
    /** @type {{ data: string, payload: Object }[] | null} */
    export let ocorrencias = null;

    export let enviando = false;

    /** @type {{ atual: number, total: number }} */
    export let progresso = { atual: 0, total: 0 };

    /** @type {{ sucesso: { data: string, criado: any }[], falha: { data: string, erro: string }[] } | null} */
    export let resultadoFinal = null;

    export let horaInicio = "";
    export let horaFim = "";
    export let onConfirmar;
    export let onCancelar;
</script>

{#if ocorrencias || resultadoFinal}
    <div class="modal-overlay">
        <div class="modal-recorrencia">
            {#if resultadoFinal}
                <h3>Resultado do agendamento</h3>
                <p class="msg-sucesso">
                    {resultadoFinal.sucesso.length} agendamento(s) criado(s) com
                    sucesso.
                </p>
                {#if resultadoFinal.falha.length > 0}
                    <p class="msg-erro">
                        {resultadoFinal.falha.length} falharam:
                    </p>
                    <ul class="lista-falhas">
                        {#each resultadoFinal.falha as f}
                            <li>{f.data}: {f.erro}</li>
                        {/each}
                    </ul>
                {/if}
                <div class="bottom-action">
                    <button class="btn-primary" on:click={onCancelar}>
                        Fechar
                    </button>
                </div>
            {:else}
                <h3>Confirmar {ocorrencias.length} agendamento(s)</h3>
                <ul class="lista-ocorrencias">
                    {#each ocorrencias as o}
                        <li>{o.data} — {horaInicio} às {horaFim}</li>
                    {/each}
                </ul>
                <p class="aviso-modal">
                    Alguns podem falhar caso já exista conflito de horário.
                </p>
                <div class="bottom-action">
                    <button
                        class="btn-secondary"
                        on:click={onCancelar}
                        disabled={enviando}
                    >
                        Cancelar
                    </button>
                    <button
                        class="btn-primary"
                        on:click={onConfirmar}
                        disabled={enviando}
                    >
                        {enviando
                            ? `Enviando ${progresso.atual}/${progresso.total}...`
                            : "Confirmar e Agendar"}
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}
