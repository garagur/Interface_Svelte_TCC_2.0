import { B as escape_html, Y as fallback, a as ensure_array_like, c as slot, l as stringify, n as attr_class, r as bind_props } from "./dev.js";
//#region src/lib/components/SemanalGrade/GradeSemanal.svelte
function GradeSemanal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dias = fallback($$props["dias"], () => [], true);
		let blocos = fallback($$props["blocos"], () => [], true);
		let carregandoLista = fallback($$props["carregandoLista"], false);
		let filtrarPor = fallback($$props["filtrarPor"], null);
		const diasLabels = {
			domingo: "Domingo",
			segunda: "Segunda",
			terca: "Terça",
			quarta: "Quarta",
			quinta: "Quinta",
			sexta: "Sexta",
			sabado: "Sábado"
		};
		const diasFimDeSemana = ["sabado", "domingo"];
		function blocosOrdenados(dia) {
			return blocos.filter((b) => {
				if (b.dia_semana !== dia) return false;
				if (filtrarPor && filtrarPor.valor != null) return b[filtrarPor.campo] == filtrarPor.valor;
				return true;
			}).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
		}
		if (carregandoLista) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio svelte-n39eg1">Carregando horários...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grade-wrapper svelte-n39eg1"><!--[-->`);
			const each_array = ensure_array_like(dias);
			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let dia = each_array[$$index_1];
				$$renderer.push(`<div${attr_class(`dia-coluna ${stringify(diasFimDeSemana.includes(dia) ? "fds" : "")}`, "svelte-n39eg1")}><div class="dia-header svelte-n39eg1">${escape_html(diasLabels[dia])}</div> <div class="dia-blocos svelte-n39eg1">`);
				const each_array_1 = ensure_array_like(blocosOrdenados(dia));
				if (each_array_1.length !== 0) {
					$$renderer.push("<!--[-->");
					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let bloco = each_array_1[$$index];
						$$renderer.push(`<!--[-->`);
						slot($$renderer, $$props, "default", { bloco }, null);
						$$renderer.push(`<!--]-->`);
					}
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push(`<div class="bloco-vazio svelte-n39eg1">—</div>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, {
			dias,
			blocos,
			carregandoLista,
			filtrarPor
		});
	});
}
//#endregion
export { GradeSemanal as t };
