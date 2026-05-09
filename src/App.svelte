<script>
  import LoginScreen from './routes/LoginScreen.svelte'
  import MainScreen from './routes/MainScreen.svelte'
  import CadastroUserScreen from './routes/CadastroUserScreen.svelte'

  let tela = 'login'
  let token = ''
  let matricula = ''

  function navegarPara(nomeTela) {
    tela = nomeTela
  }

  function aoFazerLogin(data) {
    token = data.token
    matricula = data.user?.matricula || ''
    tela = 'main'
  }

  function aoSair() {
    token = ''
    matricula = ''
    tela = 'login'
  }
</script>

{#if tela === 'login'}
  <LoginScreen onLogin={aoFazerLogin} />

{:else if tela === 'main'}
  <MainScreen
    {matricula}
    {token}
    aoSair={aoSair}
    onNavigate={navegarPara}
  />
{:else if tela === 'CadastroUserScreen'}
  <CadastroUserScreen
    {token}
    matriculaLogado={matricula}
    onSair={() => navegarPara('main')}
  />

{/if}