export function normalizarDataHora(valor) {
    if (!valor && valor !== 0) return null;

    const texto = String(valor).trim();
    if (!texto) return null;

    const valorComT = texto.includes("T") ? texto : texto.replace(" ", "T");
    const data = new Date(valorComT.slice(0, 19));

    return Number.isNaN(data.getTime()) ? null : data;
}

export function encontrarConflitosOciosos(agendamento, lista = []) {
    if (!agendamento || !agendamento.data_hora_inicio || !agendamento.data_hora_fim) {
        return [];
    }

    const recursoChave = agendamento.tipo === "equipamento" ? "equipamento_id" : "sala_id";
    const idRecurso = String(agendamento[recursoChave] ?? "");
    const inicioAtual = normalizarDataHora(agendamento.data_hora_inicio);
    const fimAtual = normalizarDataHora(agendamento.data_hora_fim);

    if (!inicioAtual || !fimAtual || fimAtual <= inicioAtual) {
        return [];
    }

    return lista.filter((item) => {
        if (!item || item.id === agendamento.id) return false;
        if (item.status !== "ocioso" || item.tipo !== agendamento.tipo) return false;

        const itemRecurso = String(item[recursoChave] ?? "");
        if (itemRecurso !== idRecurso) return false;

        const inicioItem = normalizarDataHora(item.data_hora_inicio);
        const fimItem = normalizarDataHora(item.data_hora_fim);

        if (!inicioItem || !fimItem || fimItem <= inicioItem) return false;

        return inicioAtual.getTime() < fimItem.getTime() && inicioItem.getTime() < fimAtual.getTime();
    });
}
