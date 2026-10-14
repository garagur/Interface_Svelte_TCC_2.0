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
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
    );
    if (!partes) {
        return null;
    }

    const [, ano, mes, dia, horas, minutos] = partes.map(Number);
    const horarioComoUtc = Date.UTC(ano, mes - 1, dia, horas, minutos);
    const dataUtc = new Date(horarioComoUtc);
    if (
        dataUtc.getUTCFullYear() !== ano ||
        dataUtc.getUTCMonth() !== mes - 1 ||
        dataUtc.getUTCDate() !== dia ||
        dataUtc.getUTCHours() !== horas ||
        dataUtc.getUTCMinutes() !== minutos
    ) {
        return null;
    }

    let instante = horarioComoUtc;
    for (let tentativa = 0; tentativa < 3; tentativa += 1) {
        const valores = Object.fromEntries(
            formatadorCuiaba
                .formatToParts(new Date(instante))
                .map(({ type, value }) => [type, Number(value)]),
        );
        const representadoComoUtc = Date.UTC(
            valores.year,
            valores.month - 1,
            valores.day,
            valores.hour,
            valores.minute,
        );
        const ajuste = horarioComoUtc - representadoComoUtc;
        instante += ajuste;
        if (ajuste === 0) break;
    }

    return new Date(instante);
}

export function validarAntecedenciaAgendamento(dataHoraInicio, agora = new Date()) {
    const inicio = converterDataHoraCuiabaParaInstante(dataHoraInicio);
    if (!inicio) {
        return 'Informe uma data e um horário válidos.';
    }

    if (inicio.getTime() - agora.getTime() < 15 * 60 * 1000) {
        return 'O agendamento deve ser feito com pelo menos 15 minutos de antecedência.';
    }

    return null;
}