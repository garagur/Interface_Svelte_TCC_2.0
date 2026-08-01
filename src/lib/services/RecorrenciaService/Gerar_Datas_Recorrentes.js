// src/lib/services/RecorrenciaService/Gerar_Datas_Recorrentes.js

const MAPA_DIAS = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };
const DURACAO_DIAS = { semanal: 7, quinzenal: 14 };

/**
 * Formata um objeto Date como 'YYYY-MM-DD' no fuso local.
 * @param {Date} data
 * @returns {string}
 */
function formatarDataLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

/**
 * Gera as datas de ocorrência de um agendamento recorrente.
 * Semanal cobre 7 dias a partir da data de início; quinzenal cobre 14 dias.
 * @param {Object} params
 * @param {string[]} params.diasSemana - ex: ['seg', 'qua', 'sex']
 * @param {string} params.dataInicio - 'YYYY-MM-DD'
 * @param {string} params.horaInicio - 'HH:mm'
 * @param {string} params.horaFim - 'HH:mm'
 * @param {'semanal'|'quinzenal'} params.recorrencia
 * @returns {{ data: string, data_hora_inicio: string, data_hora_fim: string }[]}
 */
export function gerarDatasRecorrentes({ diasSemana, dataInicio, horaInicio, horaFim, recorrencia }) {
    const diasSelecionados = diasSemana.map(d => MAPA_DIAS[d]);

    const [anoIni, mesIni, diaIni] = dataInicio.split('-').map(Number);
    const inicio = new Date(anoIni, mesIni - 1, diaIni);

    const totalDias = DURACAO_DIAS[recorrencia];
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + (totalDias - 1));

    const ocorrencias = [];
    let dataAtual = new Date(inicio);

    while (dataAtual <= fim) {
        if (diasSelecionados.includes(dataAtual.getDay())) {
            const dataStr = formatarDataLocal(dataAtual);
            ocorrencias.push({
                data: dataStr,
                data_hora_inicio: `${dataStr} ${horaInicio}:00`,
                data_hora_fim: `${dataStr} ${horaFim}:00`,
            });
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
    }

    return ocorrencias;
}