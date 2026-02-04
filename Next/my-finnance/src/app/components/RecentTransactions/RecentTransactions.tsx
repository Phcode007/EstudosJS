
'use client';

import { Transaction, CATEGORIES } from '@/app/types/transaction';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import styles from './RecentTransactions.module.css';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // Obtém nome da categoria
  const getCategoryInfo = (categoryId: string, type: 'income' | 'expense') => {
    const categoryList = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
    const category = categoryList.find(cat => cat.id === categoryId);
    return category || { name: 'Desconhecida', color: '#666' };
  };

  if (transactions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>🕒 Transações Recentes</h3>
          <Link href="/transactions" className={styles.viewAllLink}>
            Ver todas →
          </Link>
        </div>
        <div className={styles.emptyState}>
          <p>📭 Nenhuma transação recente</p>
          <p>Adicione sua primeira transação!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🕒 Transações Recentes</h3>
        <Link href="/transactions" className={styles.viewAllLink}>
          Ver todas ({transactions.length}) →
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const categoryInfo = getCategoryInfo(transaction.category, transaction.type);
              const formattedDate = format(new Date(transaction.date), 'dd/MM', {
                locale: ptBR,
              });

              return (
                <tr key={transaction.id} className={styles.tableRow}>
                  <td className={styles.dateCell}>
                    {formattedDate}
                  </td>
                  <td className={styles.descriptionCell}>
                    <div className={styles.descriptionWrapper}>
                      <span className={styles.descriptionText}>
                        {transaction.description}
                      </span>
                      {transaction.description.length > 30 && (
                        <span className={styles.descriptionTooltip}>
                          {transaction.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.categoryCell}>
                    <span
                      className={styles.categoryBadge}
                      style={{ 
                        backgroundColor: `${categoryInfo.color}20`,
                        color: categoryInfo.color 
                      }}
                    >
                      {categoryInfo.name}
                    </span>
                  </td>
                  <td className={`${styles.amountCell} ${transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount}`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                  </td>
                  <td className={styles.typeCell}>
                    <span className={`${styles.typeBadge} ${transaction.type === 'income' ? styles.incomeBadge : styles.expenseBadge}`}>
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <Link href="/transactions" className={styles.addButton}>
          ➕ Adicionar Nova Transação
        </Link>
      </div>
    </div>
  );
}