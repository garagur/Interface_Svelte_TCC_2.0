import test from 'node:test';
import assert from 'node:assert/strict';
import { validarAntecedenciaAgendamento } from './Validar_Antecedencia_Agendamento.js';

test('bloqueia agendamento antes do horário atual em UTC', () => {
    const agora = new Date('2024-01-01T00:10:00Z');

    const erro = validarAntecedenciaAgendamento('2024-01-01T00:00', agora);

    assert.equal(
        erro,
        'O agendamento não pode ser realizado antes do horário atual.',
    );
});

test('permite agendamento no futuro, mesmo sem 15 minutos de antecedência', () => {
    const agora = new Date('2024-01-01T00:10:00Z');

    const erro = validarAntecedenciaAgendamento('2024-01-01T00:12', agora);

    assert.equal(erro, null);
});
