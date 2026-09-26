export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.BTyb9PEt.js",app:"_app/immutable/entry/app.CFg0lmf2.js",imports:["_app/immutable/entry/start.BTyb9PEt.js","_app/immutable/chunks/BbjGjPMZ.js","_app/immutable/chunks/BuFlayix.js","_app/immutable/chunks/DtWb0DmJ.js","_app/immutable/chunks/DK3Fl9T5.js","_app/immutable/entry/app.CFg0lmf2.js","_app/immutable/chunks/kNaey6uv.js","_app/immutable/chunks/DtWb0DmJ.js","_app/immutable/chunks/DK3Fl9T5.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js')),
			__memo(() => import('./nodes/16.js')),
			__memo(() => import('./nodes/17.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/admin/cadastro-equipamento",
				pattern: /^\/admin\/cadastro-equipamento\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/admin/cadastro-horario",
				pattern: /^\/admin\/cadastro-horario\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/admin/cadastro-sala",
				pattern: /^\/admin\/cadastro-sala\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/admin/cadastro-turma",
				pattern: /^\/admin\/cadastro-turma\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/admin/cadastro-usuario",
				pattern: /^\/admin\/cadastro-usuario\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/agendamento",
				pattern: /^\/agendamento\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/main",
				pattern: /^\/main\/?$/,
				params: [],
				page: { layouts: [0,6,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/minhas_informacoes",
				pattern: /^\/minhas_informacoes\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 17 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
