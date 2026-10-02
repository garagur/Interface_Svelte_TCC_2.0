<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { onMount, tick } from "svelte";

    export let titulo = "Portal de Agendamento";
    export let subtitulo = "";
    export let nome = "";
    export let matricula = "";
    export let cargo = "";
    export let onVoltar = null;
    export let onLogout = null;

    let mostrarMenuUsuario = false;
    const atalhosAdmin = [
        {
            label: "Salas",
            title: "Gerenciar salas",
            icon: "meeting_room",
            path: "/admin/cadastro-sala",
        },
        {
            label: "Turmas",
            title: "Gerenciar turmas",
            icon: "groups",
            path: "/admin/cadastro-turma",
        },
        {
            label: "Horários",
            title: "Gerenciar horários",
            icon: "calendar_month",
            path: "/admin/cadastro-horario",
        },
        {
            label: "Equipamentos",
            title: "Gerenciar equipamentos",
            icon: "devices",
            path: "/admin/cadastro-equipamento",
        },
        {
            label: "Usuários",
            title: "Gerenciar usuários",
            icon: "person_add",
            path: "/admin/cadastro-usuario",
        },
    ];

    $: caminhoAtual = $page.url.pathname;
    $: subtituloAtual =
        subtitulo ||
        atalhosAdmin.find((atalho) => caminhoAtual.startsWith(atalho.path))
            ?.title ||
        "";
    $: paginaAtiva = caminhoAtual.startsWith("/main")
        ? "main"
        : caminhoAtual.startsWith("/agendamento")
          ? "agendamento"
          : caminhoAtual.startsWith("/informacoes") ||
              caminhoAtual.startsWith("/minhas_informacoes")
            ? "informacoes"
            : "";

    onMount(() => {
        nome ||= localStorage.getItem("nome") || "";
        matricula ||= localStorage.getItem("matricula") || "";
        cargo ||= localStorage.getItem("cargo") || "";
    });

    function fecharMenuUsuario(event) {
        if (event?.target?.closest?.(".cabecalho-global-conta")) return;
        mostrarMenuUsuario = false;
    }

    async function irPara(rota) {
        mostrarMenuUsuario = false;
        const [caminho, hash] = rota.split("#");
        await goto(hash ? `${caminho}#${hash}` : caminho);
        await tick();

        if (hash) {
            document
                .getElementById(hash)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function sair() {
        mostrarMenuUsuario = false;
        if (onLogout) {
            onLogout();
            return;
        }
        localStorage.clear();
        goto("/login");
    }
</script>

<svelte:window on:click={fecharMenuUsuario} />

<header class="cabecalho-global">
    <div class="cabecalho-global-identidade">
        <h1>{titulo}</h1>
        {#if subtituloAtual}<span>{subtituloAtual}</span>{/if}
        {#if nome || matricula}
            <span class="cabecalho-global-usuario">
                {nome}{#if matricula}{nome ? " | " : ""}Matrícula: {matricula}{/if}
            </span>
        {/if}
    </div>

    <nav
        class="cabecalho-global-navegacao"
        class:administrador={cargo === "admin"}
        aria-label="Navegação principal"
    >
        <button
            type="button"
            class="cabecalho-global-link"
            class:ativo={paginaAtiva === "main"}
            aria-current={paginaAtiva === "main" ? "page" : undefined}
            on:click={() => goto("/main")}
        >
            <span class="material-symbols-outlined" aria-hidden="true"
                >home</span
            >
            <span>Main</span>
        </button>
        <button
            type="button"
            class="cabecalho-global-link"
            class:ativo={paginaAtiva === "agendamento"}
            aria-current={paginaAtiva === "agendamento" ? "page" : undefined}
            on:click={() => goto("/agendamento")}
        >
            <span class="material-symbols-outlined" aria-hidden="true"
                >event_available</span
            >
            <span>Agendar</span>
        </button>
        <button
            type="button"
            class="cabecalho-global-link"
            class:ativo={paginaAtiva === "informacoes"}
            aria-current={paginaAtiva === "informacoes" ? "page" : undefined}
            on:click={() => goto("/informacoes")}
        >
            <span class="material-symbols-outlined" aria-hidden="true"
                >inventory_2</span
            >
            <span>Informações</span>
        </button>
        {#if cargo === "admin"}
            {#each atalhosAdmin as atalho (atalho.path)}
                <button
                    type="button"
                    class="cabecalho-global-link cabecalho-global-link-admin"
                    class:ativo={caminhoAtual.startsWith(atalho.path)}
                    aria-current={caminhoAtual.startsWith(atalho.path)
                        ? "page"
                        : undefined}
                    title={atalho.title}
                    on:click={() => goto(atalho.path)}
                >
                    <span class="material-symbols-outlined" aria-hidden="true"
                        >{atalho.icon}</span
                    >
                    <span>{atalho.label}</span>
                </button>
            {/each}
        {/if}
    </nav>

    <div class="cabecalho-global-acoes">
        {#if onVoltar}
            <button
                type="button"
                class="cabecalho-global-icone"
                on:click={onVoltar}
                title="Voltar para Main"
                aria-label="Voltar para Main"
            >
                <span class="material-symbols-outlined" aria-hidden="true"
                    >arrow_back</span
                >
            </button>
        {/if}
        <div class="cabecalho-global-conta">
            <button
                type="button"
                class="cabecalho-global-icone"
                on:click={() => (mostrarMenuUsuario = !mostrarMenuUsuario)}
                title="Minha conta"
                aria-label="Minha conta"
                aria-haspopup="true"
                aria-expanded={mostrarMenuUsuario}
            >
                <span class="material-symbols-outlined" aria-hidden="true"
                    >account_circle</span
                >
            </button>

            {#if mostrarMenuUsuario}
                <ul class="cabecalho-global-menu" role="menu">
                    <li role="none">
                        <button
                            role="menuitem"
                            on:click={() => irPara("/minhas_informacoes#dados")}
                        >
                            <span
                                class="material-symbols-outlined"
                                aria-hidden="true">person</span
                            >
                            Meus Dados
                        </button>
                    </li>
                    <li role="none">
                        <button
                            role="menuitem"
                            on:click={() =>
                                irPara("/minhas_informacoes#estatisticas")}
                        >
                            <span
                                class="material-symbols-outlined"
                                aria-hidden="true">query_stats</span
                            >
                            Minhas Estatísticas
                        </button>
                    </li>
                    <li role="none">
                        <button
                            role="menuitem"
                            on:click={() =>
                                irPara("/minhas_informacoes#agendamentos")}
                        >
                            <span
                                class="material-symbols-outlined"
                                aria-hidden="true">event_available</span
                            >
                            Meus Agendamentos
                        </button>
                    </li>
                    {#if cargo === "educador"}
                        <li role="none">
                            <button
                                role="menuitem"
                                on:click={() =>
                                    irPara("/minhas_informacoes#grade")}
                            >
                                <span
                                    class="material-symbols-outlined"
                                    aria-hidden="true">calendar_month</span
                                >
                                Minha Grade de Aulas
                            </button>
                        </li>
                    {/if}
                    <li role="none">
                        <button
                            role="menuitem"
                            class="cabecalho-global-sair"
                            on:click={sair}
                        >
                            <span
                                class="material-symbols-outlined"
                                aria-hidden="true">logout</span
                            >
                            Sair
                        </button>
                    </li>
                </ul>
            {/if}
        </div>
    </div>
</header>
