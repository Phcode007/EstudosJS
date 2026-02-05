/* eslint-disable react-hooks/error-boundaries */
import { getRecentTransactions, getBalance } from '@/app/lib/supabase/db';
import DashboardCards from '@/app/components/DashboardCards/DashboardCards';
import RecentTransactions from '@/app/components/RecentTransactions/RecentTransactions';
import styles from './page.module.css';

export default async function DashboardPage() {
  try {
    const [recentTransactions, balance] = await Promise.all([
      getRecentTransactions(5),
      getBalance(),
    ]);

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>📊 Dashboard Financeiro</h1>
          <p className={styles.subtitle}>
            Visão geral das suas finanças • Saldo atual: R$ {balance.balance.toFixed(2)}
          </p>
        </header>
        
        <div className={styles.content}>
          <DashboardCards balance={balance} />
          
          <RecentTransactions transactions={recentTransactions} />
          
          <div className={styles.summarySection}>
            <div className={styles.summaryCard}>
              <h3>📈 Insights</h3>
              <div className={styles.insights}>
                <div className={styles.insightItem}>
                  <span className={styles.insightIcon}>💡</span>
                  <div>
                    <p className={styles.insightTitle}>Meta do Mês</p>
                    <p className={styles.insightText}>
                      {balance.balance > 0 ? 'Ótimo trabalho! Você está com saldo positivo.' : 'Fique atento ao seu saldo negativo.'}
                    </p>
                  </div>
                </div>
                <div className={styles.insightItem}>
                  <span className={styles.insightIcon}>📅</span>
                  <div>
                    <p className={styles.insightTitle}>Próximos Passos</p>
                    <p className={styles.insightText}>
                      {recentTransactions.length === 0 
                        ? 'Comece adicionando suas transações!'
                        : 'Continue registrando todas as suas movimentações.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.placeholder}>
              <h3>📊 Gráficos em Desenvolvimento</h3>
              <p>Em breve: gráficos de evolução, distribuição por categoria e mais análises!</p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return (
      <div className={styles.errorContainer}>
        <h1>📊 Dashboard Financeiro</h1>
        <div className={styles.errorCard}>
          <p>❌ Erro ao carregar dados do dashboard</p>
          <p>Verifique sua conexão com o banco de dados.</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
}