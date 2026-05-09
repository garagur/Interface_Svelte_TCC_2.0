<script>
  import { logoutUser } from '../services/LogoutService.js'

  export let matricula = ''
  export let token = ''
  export let aoSair
  export let onNavigate

  const agendamentos = [
    { nome: 'João Silva', item: 'Sala 101', dataInicio: '28/04/2025 08:00', dataFim: '28/04/2025 10:00' },
    { nome: 'Maria Souza', item: 'Projetor HD', dataInicio: '28/04/2025 09:00', dataFim: '28/04/2025 11:00' },
    { nome: 'Carlos Lima', item: 'Sala de Reunião', dataInicio: '29/04/2025 14:00', dataFim: '29/04/2025 16:00' },
    { nome: 'Ana Paula', item: 'Notebook Dell', dataInicio: '30/04/2025 07:00', dataFim: '30/04/2025 12:00' },
  ] 

  async function navigate(path, params = null) {
    if (path === 'Pop') {
      await logoutUser(token)
      aoSair?.()
      return
    }
    onNavigate?.(path, params)
  }
</script>

<div class="scaffold">
  <header class="app-bar">
    
    <!-- 1. Lado Esquerdo -->
    <div class="title-section">
      <h1>Portal de Agendamento</h1>
      <span>Matrícula: {matricula}</span>
    </div>

    <!-- 2. Centro Absoluto -->
    <nav class="nav-menu">
      <button class="menu-card" on:click={() => navigate('ScheduleScreen')}>
        <span class="material-symbols-outlined">calendar_today</span>
        <span>Meus<br>Agendamentos</span>
      </button>
      
      <button class="menu-card" on:click={() => navigate('RegisterRoomScreen')}>
        <span class="material-symbols-outlined">add_location</span>
        <span>Cadastrar<br>Sala</span>
      </button>

      <button class="menu-card" on:click={() => navigate('EquipmentRegistrationScreen')}>
        <span class="material-symbols-outlined">playlist_add</span>
        <span>Cadastrar<br>Equipamento</span>
      </button>

     <button class="menu-card" on:click={() => navigate('CadastroUserScreen')}>
        <span class="material-symbols-outlined">person_add</span>
        <span>Cadastrar<br>Usuário</span>
      </button>
    </nav>

    <!-- 3. Lado Direito -->
    <div class="actions-section">
      <button class="btn-icon" on:click={() => navigate('Pop')} title="Sair">
        <span class="material-symbols-outlined">logout</span>
      </button>
    </div>
    
  </header>

  <main class="body-content">
    <div class="table-header-title">
      <div class="title-left">
        <span class="material-symbols-outlined text-blue">list_alt</span>
        <h2>Agendamentos Recentes</h2>
      </div>
      <div class="badge">
        {agendamentos.length} registros
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table-header">
        <div class="th flex-2">Nome</div>
        <div class="th flex-2">Item</div>
        <div class="th flex-2">Início</div>
        <div class="th flex-2">Fim</div>
        <div class="th flex-1">Ações</div>
      </div>
      
      <div class="table-body">
        {#each agendamentos as item, index}
          <div class="table-row {index % 2 === 0 ? 'even' : 'odd'}">
            <div class="td flex-2">
              <span class="material-symbols-outlined icon-tiny">person</span>
              <span class="text-truncate">{item.nome}</span>
            </div>
            
            <button class="td flex-2 item-clickable" on:click={() => navigate('SchedulesByItemScreen', item)}>
              <span class="material-symbols-outlined icon-tiny">inventory_2</span>
              <span class="text-truncate text-link">{item.item}</span>
            </button>
            
            <div class="td flex-2">
              <span class="material-symbols-outlined icon-tiny">schedule</span>
              <span class="text-truncate">{item.dataInicio}</span>
            </div>
            
            <div class="td flex-2">
              <span class="material-symbols-outlined icon-tiny">schedule</span>
              <span class="text-truncate">{item.dataFim}</span>
            </div>
            
            <div class="td flex-1 action-cell">
              <button class="btn-info" on:click={() => navigate('ScheduleDetailScreen', item)}>
                <span class="material-symbols-outlined">info</span>
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="bottom-action">
      <button class="btn-primary" on:click={() => navigate('ScheduleScreen')}>
        <span class="material-symbols-outlined">add_circle</span>
        Novo Agendamento
      </button>
    </div>
  </main>
</div>

<style>
  :root {
    --blue-primary: #2196F3;
    --blue-dark: #1976D2;
    --blue-light: #BBDEFB;
    --blue-50: #E3F2FD;
    --white: #FFFFFF;
    --text-dark: #424242;
  }

  * { box-sizing: border-box; }
  .scaffold {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: Arial, sans-serif;
    background-color: #FAFAFA;
  }

  /* --- APP BAR & MENU --- */
  .app-bar {
    background-color: var(--blue-primary);
    color: var(--white);
    padding: 12px 24px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

 .title-section {
    flex: 1; 
    display: flex;
    flex-direction: column; /* Volta a empilhar titulo e matricula corretamente */
    align-items: flex-start;
  }
  .title-section h1 { margin: 0; font-size: 18px; }
  .title-section span { font-size: 11px; opacity: 0.9; margin-top: 2px; }

.nav-menu {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 12px;
  }

.actions-section {
    flex: 1; 
    display: flex;
    justify-content: flex-end;
  }
  .btn-icon { 
    background: none; 
    border: none; 
    color: white; 
    cursor: pointer; 
    padding: 8px; 
    border-radius: 50%; 
    transition: background 0.2s;
  }
  .btn-icon:hover { background: rgba(255,255,255,0.1); }

  /* BOTOES QUADRADOS DO MENU */
 .menu-card {
    width: 84px; 
    height: 84px;
    background-color: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--white);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  .menu-card:hover {
    background-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
  .menu-card .material-symbols-outlined {
    font-size: 24px;
    margin-bottom: 4px;
  }
  .menu-card span:not(.material-symbols-outlined) {
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    line-height: 1.2;
  }

  .body-content { 
    display: flex; 
    flex-direction: column; 
    flex: 1; 
    overflow: hidden; 
    /* Adicione estas 3 linhas abaixo: */
    width: 100%;
    max-width: 1100px; /* Você pode aumentar ou diminuir esse valor como achar melhor */
    margin: 0 auto; /* O 'auto' nas laterais garante que a tabela fique perfeitamente no centro */
  }

  .table-header-title { padding: 24px 24px 12px; display: flex; justify-content: space-between; align-items: center; }
  .title-left { display: flex; align-items: center; gap: 8px; }
  .text-blue { color: var(--blue-primary); }
  .table-header-title h2 { margin: 0; font-size: 16px; color: var(--blue-primary); }
  .badge { background-color: var(--blue-50); border: 1px solid var(--blue-light); color: var(--blue-dark); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
  
  .table-wrapper { margin: 0 24px; flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .table-header { background-color: var(--blue-primary); color: var(--white); display: flex; border-radius: 12px 12px 0 0; }
  .table-header .th { padding: 12px 8px; font-size: 12px; font-weight: bold; text-align: center; }
  .table-body { flex: 1; overflow-y: auto; border: 1px solid var(--blue-light); border-top: none; border-radius: 0 0 12px 12px; }
  .table-row { display: flex; transition: background 0.2s; }
  .table-row:hover { background-color: #f1f8ff; }
  .table-row.even { background-color: var(--white); }
  .table-row.odd { background-color: var(--blue-50); }
  
  .td { padding: 12px 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; color: var(--text-dark); }
  .item-clickable { background: none; border: none; cursor: pointer; }
  .text-link { color: var(--blue-dark); font-weight: bold; text-decoration: underline; }
  .flex-2 { flex: 2; width: 0; }
  .flex-1 { flex: 1; width: 0; }
  .text-truncate { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .icon-tiny { font-size: 14px; color: #42A5F5; margin-bottom: 2px; }
  .action-cell { display: flex; align-items: center; justify-content: center; }
  .btn-info { background: none; border: none; color: var(--blue-primary); cursor: pointer; padding: 6px; border-radius: 50%; transition: background 0.2s;}
  .btn-info:hover { background-color: var(--blue-50); }
  
  .bottom-action { 
    padding: 24px; 
    display: flex;
    justify-content: center; 
  }
  .btn-primary { 
    background-color: var(--blue-primary); 
    color: var(--white); 
    border: none; 
    border-radius: 12px; 
    padding: 16px 40px;
    font-size: 16px; 
    font-weight: bold; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    gap: 8px; 
    cursor: pointer; 
    transition: background 0.2s;
  }
  .btn-primary:hover { background-color: var(--blue-dark); }
</style>