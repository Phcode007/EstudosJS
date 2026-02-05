/* eslint-disable react-hooks/error-boundaries */
import { getRecentTransactions, getBalance } from '@/app/lib/supabase/db';
import DashboardCards from '@/app/components/DashboardCards/DashboardCards';
import RecentTransactions from '@/app/components/RecentTransactions/RecentTransactions';
import QuickStats from '@/app/components/QuickStats/QuickStats';
import styles from './page.module.css';

export default async function DashboardPage() {
  try {
    // Busca dados no servidor (Server Component)
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
          {/* Cards com totais */}
          <DashboardCards balance={balance} />
          
          {/* Estatísticas rápidas */}
          <QuickStats />
          
          {/* Transações recentes */}
          <RecentTransactions transactions={recentTransactions} />
          
          {/* Insights rápidos */}
          <div className={styles.quickInsights}>
            <div className={styles.insightCard}>
              <h3>🎯 Metas do Mês</h3>
              <p>
                {balance.balance > 0 
                  ? `Excelente! Você economizou R$ ${balance.balance.toFixed(2)} este mês.`
                  : 'Atenção: Seu saldo está negativo. Reveja suas despesas.'
                }
              </p>
            </div>
            <div className={styles.insightCard}>
              <h3>📋 Próximos Passos</h3>
              <p>
                {recentTransactions.length === 0
                  ? 'Comece adicionando suas primeiras transações!'
                  : `Você tem ${recentTransactions.length} transações recentes. Continue assim!`
                }
              </p>
            </div>
            <div className={styles.insightCard}>
              <h3>📈 Ver Estatísticas</h3>
              <p>
                Acesse a página de estatísticas para análises detalhadas e gráficos avançados.
              </p>
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