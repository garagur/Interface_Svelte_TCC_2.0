import "../../../chunks/internal.js";
import { C as escape_html, S as attr, a as head, n as bind_props, st as fallback } from "../../../chunks/server.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import { t as API_URL } from "../../../chunks/constants.js";
//#region src/lib/components/login/LoginCard.svelte
function LoginCard($$renderer, $$props) {
	let email = $$props["email"];
	let otp = $$props["otp"];
	let erro = $$props["erro"];
	let carregando = $$props["carregando"];
	let etapa = $$props["etapa"];
	let onSubmitEmail = $$props["onSubmitEmail"];
	let onSubmitOtp = $$props["onSubmitOtp"];
	let avisoSessao = fallback($$props["avisoSessao"], "");
	$$renderer.push(`<div class="login-wrapper"><div class="card"><h2>Acesso ao Sistema</h2> `);
	if (etapa === 1) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<form><div class="field"><label for="email">Email</label> <input id="email" type="email"${attr("value", email)} placeholder="seu@email.com" required=""/></div> `);
		if (avisoSessao) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="aviso-sessao">${escape_html(avisoSessao)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (erro) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="erro">${escape_html(erro)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="submit" class="btn-main"${attr("disabled", carregando, true)}>${escape_html(carregando ? "Verificando..." : "Verificar usuário")}</button></form>`);
	} else {
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<p class="info">Código enviado para <strong>${escape_html(email)}</strong></p> <form><div class="field"><label for="otp">Código de acesso</label> <input id="otp" type="text"${attr("value", otp)} placeholder="000000" maxlength="6" required=""/></div> `);
		if (erro) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="erro">${escape_html(erro)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="submit" class="btn-main"${attr("disabled", carregando, true)}>${escape_html(carregando ? "Entrando..." : "Entrar")}</button></form>`);
	}
	$$renderer.push(`<!--]--></div></div>`);
	bind_props($$props, {
		email,
		otp,
		erro,
		carregando,
		etapa,
		onSubmitEmail,
		onSubmitOtp,
		avisoSessao
	});
}
//#endregion
//#region src/config/routes/Login_Endpoints.js
var LOGIN_ROUTES = {
	sendOtp: `${API_URL}/auth/send-otp`,
	login: `${API_URL}/auth/login`
};
//#endregion
//#region src/lib/services/UserServices/Login_User_Service.js
var MSG_SEM_CONEXAO = "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
async function parseJson(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
async function fetchComTratamento(url, options) {
	let resp;
	try {
		resp = await fetch(url, options);
	} catch (e) {
		throw new Error(MSG_SEM_CONEXAO);
	}
	if ([
		502,
		503,
		504
	].includes(resp.status)) throw new Error(MSG_SEM_CONEXAO);
	return resp;
}
async function sendOtp(email) {
	if (!email) throw new Error("Preencha o email!");
	const resp = await fetchComTratamento(LOGIN_ROUTES.sendOtp, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({ email })
	});
	const dados = await parseJson(resp);
	if (!resp.ok) throw new Error(dados?.message || MSG_SEM_CONEXAO);
	return dados;
}
async function loginUser(email, otp) {
	if (!email || !otp) throw new Error("Preencha o código enviado ao seu email!");
	const resposta = await fetchComTratamento(LOGIN_ROUTES.login, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			email,
			password: otp,
			platform: "web"
		})
	});
	const dados = await parseJson(resposta);
	if (!resposta.ok) throw new Error(dados?.message || MSG_SEM_CONEXAO);
	return {
		...dados,
		token: dados?.token || dados?.access_token,
		user: dados?.user || dados?.data?.user
	};
}
//#endregion
//#region src/routes/login/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let email = "";
		let otp = "";
		let erro = "";
		let avisoSessao = "";
		let carregando = false;
		let etapa = 1;
		async function handleSubmitEmail() {
			erro = "";
			carregando = true;
			try {
				await sendOtp(email);
				etapa = 2;
			} catch (e) {
				erro = e.message;
			} finally {
				carregando = false;
			}
		}
		async function handleSubmitOtp() {
			erro = "";
			carregando = true;
			try {
				const data = await loginUser(email, otp);
				localStorage.setItem("token", data.token);
				localStorage.setItem("cargo", data.user?.cargo || "");
				localStorage.setItem("user_id", data.user?.id || "");
				localStorage.setItem("matricula", data.user?.matricula || "");
				localStorage.setItem("nome", data.user?.nome || data.user?.name || "");
				goto("/main");
			} catch (e) {
				erro = e.message;
			} finally {
				carregando = false;
			}
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			head("1x05zx6", $$renderer, ($$renderer) => {
				$$renderer.push(`<style>
    body {
      margin: 0;
      background: linear-gradient(135deg, #585858 0%, #1f1f1f 100%);
      background-attachment: fixed;
      min-height: 100vh;
    }
  </style>`);
			});
			LoginCard($$renderer, {
				erro,
				avisoSessao,
				carregando,
				etapa,
				onSubmitEmail: handleSubmitEmail,
				onSubmitOtp: handleSubmitOtp,
				get email() {
					return email;
				},
				set email($$value) {
					email = $$value;
					$$settled = false;
				},
				get otp() {
					return otp;
				},
				set otp($$value) {
					otp = $$value;
					$$settled = false;
				}
			});
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
export { _page as default };
