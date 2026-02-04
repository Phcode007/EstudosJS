import styles from './DashboardCards.module.css';

interface BalanceData {
  income: number;
  expense: number;
  balance: number;
}

interface DashboardCardsProps {
  balance: BalanceData;
}

export default function DashboardCards({ balance }: DashboardCardsProps) {
  return (
    <div className={styles.container}>
      {/* Card de Saldo */}
      <div className={`${styles.card} ${styles.balanceCard}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}>💰</span>
          <h3 className={styles.cardTitle}>Saldo Total</h3>
        </div>
        <div className={styles.cardValue}>
          R$ {balance.balance.toFixed(2)}
        </div>
        <div className={styles.cardTrend}>
          {balance.balance >= 0 ? '✅ Positivo' : '⚠️ Negativo'}
        </div>
      </div>

      {/* Card de Receitas */}
      <div className={`${styles.card} ${styles.incomeCard}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}>📈</span>
          <h3 className={styles.cardTitle}>Receitas</h3>
        </div>
        <div className={styles.cardValue}>
          + R$ {balance.income.toFixed(2)}
        </div>
        <div className={styles.cardSubtitle}>
          Entradas este mês
        </div>
      </div>

      {/* Card de Despesas */}
      <div className={`${styles.card} ${styles.expenseCard}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}>📉</span>
          <h3 className={styles.cardTitle}>Despesas</h3>
        </div>
        <div className={styles.cardValue}>
          - R$ {balance.expense.toFixed(2)}
        </div>
        <div className={styles.cardSubtitle}>
          Saídas este mês
        </div>
      </div>

      {/* Card de Resumo */}
      <div className={`${styles.card} ${styles.summaryCard}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}>📊</span>
          <h3 className={styles.cardTitle}>Resumo</h3>
        </div>
        <div className={styles.summaryItem}>
          <span>Receitas:</span>
          <span className={styles.summaryValueIncome}>
            R$ {balance.income.toFixed(2)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span>Despesas:</span>
          <span className={styles.summaryValueExpense}>
            R$ {balance.expense.toFixed(2)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span>Saldo:</span>
          <span className={`${styles.summaryValueBalance} ${balance.balance >= 0 ? styles.positive : styles.negative}`}>
            R$ {balance.balance.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}