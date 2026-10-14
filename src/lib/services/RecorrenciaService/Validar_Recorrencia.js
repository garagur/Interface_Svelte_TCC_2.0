// src/lib/services/RecorrenciaService/Validar_Recorrencia.js

import { obterDataCuiaba } from '../AgendamentoServices/Validar_Antecedencia_Agendamento.js';

/**
 * Valida se a data de início de uma recorrência (semanal/quinzenal) é válida.
 * A data não pode ser retroativa; hoje é permitido com a antecedência mínima.
 * @param {string} dataInicio - 'YYYY-MM-DD'
 * @returns {string|null} mensagem de erro, ou null se válido
 */
export function validarDataInicioRecorrencia(dataInicio) {
    if (!dataInicio) {
        return 'Informe a data de início.';
    }

    if (dataInicio < obterDataCuiaba()) {
        return 'A data de início não pode ser anterior a hoje.';
    }
    return null;
}

/**
 * Valida o conjunto completo de campos de uma recorrência antes de gerar as datas.
 * @param {Object} params
 * @param {'avulso'|'semanal'|'quinzenal'} params.tipo
 * @param {string[]} params.diasSemana
 * @param {string} params.dataInicio - 'YYYY-MM-DD'
 * @param {string} params.horaInicio - 'HH:mm'
 * @param {string} params.horaFim - 'HH:mm'
 * @returns {string|null} mensagem de erro, ou null se válido
 */
export function validarRecorrencia({ tipo, diasSemana, dataInicio, horaInicio, horaFim }) {
    if (tipo === 'avulso') {
        return null;
    }

    if (!diasSemana || diasSemana.length === 0) {
        return 'Selecione pelo menos um dia da semana.';
    }

    if (!dataInicio || !horaInicio || !horaFim) {
        return 'Preencha a data de início e os horários.';
    }

    const erroDataInicio = validarDataInicioRecorrencia(dataInicio);
    if (erroDataInicio) {
        return erroDataInicio;
    }

    if (horaFim <= horaInicio) {
        return 'O horário de fim deve ser depois do horário de início.';
    }

    return null;
}