'use client';

import { useState, useEffect } from 'react';
import { Transaction, CATEGORIES } from '@/app/types/transaction';
import { getTransactions, deleteTransaction } from '@/app/lib/supabase/db';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './TransactionList.module.css';

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    try {
      const success = await deleteTransaction(id);
      if (success) {
        // Atualiza a lista localmente
        setTransactions(transactions.filter(t => t.id !== id));
      } else {
        alert('Erro ao excluir transação');
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Erro ao excluir transação');
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType !== 'all' && transaction.type !== filterType) {
      return false;
    }
    if (filterCategory !== 'all' && transaction.category !== filterCategory) {
      return false;
    }
    return true;
  });

  const totals = {
    income: filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    expense: filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    balance: 0
  };
  totals.balance = totals.income - totals.expense;

  const getCategoryInfo = (categoryId: string, type: 'income' | 'expense') => {
    const categoryList = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
    const category = categoryList.find(cat => cat.id === categoryId);
    return category || { name: 'Desconhecida', color: '#666' };
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando transações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>❌ {error}</p>
        <button onClick={loadTransactions} className={styles.retryButton}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          📋 Lista de Transações
          <span className={styles.count}>({filteredTransactions.length})</span>
        </h2>
        
        <div className={styles.filters}>
          {/* Filtro por tipo */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tipo:</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${filterType === 'all' ? styles.active : ''}`}
                onClick={() => setFilterType('all')}
              >
                Todas
              </button>
              <button
                className={`${styles.filterButton} ${filterType === 'income' ? styles.active : ''}`}
                onClick={() => setFilterType('income')}
              >
                Receitas
              </button>
              <button
                className={`${styles.filterButton} ${filterType === 'expense' ? styles.active : ''}`}
                onClick={() => setFilterType('expense')}
              >
                Despesas
              </button>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Categoria:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={styles.categorySelect}
            >
              <option value="all">Todas categorias</option>
              <optgroup label="Receitas">
                {CATEGORIES.income.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Despesas">
                {CATEGORIES.expense.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <button onClick={loadTransactions} className={styles.reloadButton}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className={styles.totals}>
        <div className={`${styles.totalCard} ${styles.income}`}>
          <span className={styles.totalLabel}>Receitas</span>
          <span className={styles.totalValue}>
            R$ {totals.income.toFixed(2)}
          </span>
        </div>
        <div className={`${styles.totalCard} ${styles.expense}`}>
          <span className={styles.totalLabel}>Despesas</span>
          <span className={styles.totalValue}>
            R$ {totals.expense.toFixed(2)}
          </span>
        </div>
        <div className={`${styles.totalCard} ${styles.balance}`}>
          <span className={styles.totalLabel}>Saldo</span>
          <span className={styles.totalValue}>
            R$ {totals.balance.toFixed(2)}
          </span>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>📭 Nenhuma transação encontrada</p>
          <p>Adicione sua primeira transação usando o formulário acima!</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => {
                const categoryInfo = getCategoryInfo(transaction.category, transaction.type);
                const formattedDate = format(new Date(transaction.date), 'dd/MM/yyyy', {
                  locale: ptBR,
                });

                return (
                  <tr key={transaction.id} className={styles.tableRow}>
                    <td className={styles.dateCell}>{formattedDate}</td>
                    <td className={styles.descriptionCell}>
                      {transaction.description}
                    </td>
                    <td className={styles.categoryCell}>
                      <span
                        className={styles.categoryBadge}
                        style={{ backgroundColor: categoryInfo.color + '20', color: categoryInfo.color }}
                      >
                        {categoryInfo.name}
                      </span>
                    </td>
                    <td className={styles.typeCell}>
                      <span className={`${styles.typeBadge} ${transaction.type === 'income' ? styles.incomeBadge : styles.expenseBadge}`}>
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className={`${styles.amountCell} ${transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount}`}>
                      {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className={styles.deleteButton}
                        title="Excluir"
                        aria-label="Excluir transação"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.summary}>
        <p>
          Mostrando <strong>{filteredTransactions.length}</strong> de{' '}
          <strong>{transactions.length}</strong> transações
        </p>
      </div>
    </div>
  );
}