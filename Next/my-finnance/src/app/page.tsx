import styles from './page.module.css';

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📊 Dashboard Financeiro</h1>
      <p className={styles.subtitle}>Visão geral das suas finanças</p>
      
      <div className={styles.welcomeCard}>
        <h2>Bem-vindo ao My Finnance! 👋</h2>
        <p>
          Esta é sua central de controle financeiro. Aqui você pode:
        </p>
        <ul className={styles.featuresList}>
          <li>📝 Registrar receitas e despesas</li>
          <li>📊 Visualizar gráficos de gastos</li>
          <li>🏷️ Categorizar suas transações</li>
          <li>📈 Acompanhar sua evolução financeira</li>
        </ul>
        <p className={styles.tip}>
          <strong>Dica:</strong> Comece adicionando suas primeiras transações!
        </p>
      </div>
      
      <div className={styles.placeholder}>
        <h3>📈 Cards de Resumo (Em breve)</h3>
        <p>Saldo total, receitas do mês, despesas do mês, etc.</p>
      </div>
    </div>
  );
}