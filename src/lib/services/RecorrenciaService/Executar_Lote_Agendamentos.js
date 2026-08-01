// src/lib/services/RecorrenciaService/Executar_Lote_Agendamentos.js

/**
 * Executa a criação de múltiplos agendamentos sequencialmente, um de cada vez.
 * Sequencial de propósito: evita que requisições simultâneas passem pela
 * validação de conflito de horário do backend ao mesmo tempo.
 *
 * @param {{ data: string, payload: Object }[]} ocorrencias - lista de ocorrências, cada uma com a data (pra exibição) e o payload pronto pra enviar
 * @param {(payload: Object, token: string) => Promise<any>} criarFn - função de criação do agendamento (sala ou equipamento)
 * @param {string} token
 * @param {(progresso: { atual: number, total: number }) => void} [onProgresso] - callback opcional, chamado após cada tentativa
 * @returns {Promise<{ sucesso: { data: string, criado: any }[], falha: { data: string, erro: string }[] }>}
 */
export async function executarLoteAgendamentos(ocorrencias, criarFn, token, onProgresso) {
    const resultados = { sucesso: [], falha: [] };

    for (let i = 0; i < ocorrencias.length; i++) {
        const ocorrencia = ocorrencias[i];

        try {
            const criado = await criarFn(ocorrencia.payload, token);
            resultados.sucesso.push({ data: ocorrencia.data, criado });
        } catch (e) {
            resultados.falha.push({ data: ocorrencia.data, erro: e?.message || 'Erro desconhecido.' });
        }

        if (onProgresso) {
            onProgresso({ atual: i + 1, total: ocorrencias.length });
        }
    }

    return resultados;
}