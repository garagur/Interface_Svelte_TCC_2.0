// src/lib/services/Ordenar_Lista.js
export function filtrarEOrdenar(lista, pesquisa, campo, ordenacao) {
    let resultado = lista;

    if (pesquisa?.trim()) {
        const termo = pesquisa.toLowerCase();
        resultado = resultado.filter((item) =>
            String(item[campo] ?? "").toLowerCase().includes(termo)
        );
    }

    return [...resultado].sort((a, b) => {
        const valA = String(a[campo] ?? "").toLowerCase();
        const valB = String(b[campo] ?? "").toLowerCase();
        return ordenacao === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
    });
}