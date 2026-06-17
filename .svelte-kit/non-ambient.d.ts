
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/admin/cadastro-equipamento" | "/admin/cadastro-horario" | "/admin/cadastro-sala" | "/admin/cadastro-turma" | "/admin/cadastro-usuario" | "/agendamento" | "/login" | "/main" | "/meusagendamentos";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/admin": Record<string, never>;
			"/admin/cadastro-equipamento": Record<string, never>;
			"/admin/cadastro-horario": Record<string, never>;
			"/admin/cadastro-sala": Record<string, never>;
			"/admin/cadastro-turma": Record<string, never>;
			"/admin/cadastro-usuario": Record<string, never>;
			"/agendamento": Record<string, never>;
			"/login": Record<string, never>;
			"/main": Record<string, never>;
			"/meusagendamentos": Record<string, never>
		};
		Pathname(): "/" | "/admin/cadastro-equipamento" | "/admin/cadastro-horario" | "/admin/cadastro-sala" | "/admin/cadastro-turma" | "/admin/cadastro-usuario" | "/agendamento" | "/login" | "/main" | "/meusagendamentos";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}