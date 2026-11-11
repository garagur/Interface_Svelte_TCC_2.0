const FUSO_AGENDAMENTO = 'America/Cuiaba';

const formatadorCuiaba = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_AGENDAMENTO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

export function obterDataCuiaba(agora = new Date()) {
    const partes = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone: FUSO_AGENDAMENTO,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
            .formatToParts(agora)
            .map(({ type, value }) => [type, value]),
    );

    return `${partes.year}-${partes.month}-${partes.day}`;
}

function converterDataHoraCuiabaParaInstante(dataHoraInicio) {
    const partes = dataHoraInicio.match(
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/,
    );
    if (!partes) {
        return null;
    }

    const [, ano, mes, dia, horas, minutos] = partes.map(Number);
    const instante = new Date(ano, mes - 1, dia, horas, minutos);

    if (
        Number.isNaN(instante.getTime()) ||
        instante.getFullYear() !== ano ||
        instante.getMonth() !== mes - 1 ||
        instante.getDate() !== dia ||
        instante.getHours() !== horas ||
        instante.getMinutes() !== minutos
    ) {
        return null;
    }

    return instante;
}

export function validarAntecedenciaAgendamento(dataHoraInicio, agora = new Date()) {
    const inicio = converterDataHoraCuiabaParaInstante(dataHoraInicio);
    if (!inicio) {
        return 'Informe uma data e um horário válidos.';
    }

    if (inicio.getTime() < agora.getTime()) {
        return 'O agendamento não pode ser realizado antes do horário atual.';
    }

    return null;
}