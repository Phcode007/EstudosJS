'use client';

import { useState, useEffect } from 'react';
import TransactionForm from '@/app/components/TransactionForm/TransactionForm';
import TransactionList from '@/app/components/TransactionList/TransactionList';
import { Transaction } from '@/app/types/transaction';
import { getTransactions } from '@/app/lib/supabase/db';
import styles from './page.module.css';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'form' | 'list' | 'both'>('both');
  const [stats, setStats] = useState({
    total: 0,
    income: 0,
    expense: 0,
    balance: 0
  });

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
      
      // Calcular estatísticas
      const income = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      setStats({
        total: data.length,
        income,
        expense,
        balance: income - expense
      });
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  if (loading && transactions.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando transações...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>💰 Transações</h1>
          <p className={styles.subtitle}>
            Gerencie suas receitas e despesas
          </p>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total:</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Receitas:</span>
            <span className={`${styles.statValue} ${styles.income}`}>
              R$ {stats.income.toFixed(2)}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Despesas:</span>
            <span className={`${styles.statValue} ${styles.expense}`}>
              R$ {stats.expense.toFixed(2)}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Saldo:</span>
            <span className={`${styles.statValue} ${stats.balance >= 0 ? styles.positive : styles.negative}`}>
              R$ {stats.balance.toFixed(2)}
            </span>
          </div>
        </div>
      </header>

      {/* Controles de visualização */}
      <div className={styles.viewControls}>
        <div className={styles.viewButtons}>
          <button
            className={`${styles.viewButton} ${viewMode === 'both' ? styles.active : ''}`}
            onClick={() => setViewMode('both')}
          >
            📋 Ambos
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'form' ? styles.active : ''}`}
            onClick={() => setViewMode('form')}
          >
            ➕ Adicionar
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            📊 Lista
          </button>
        </div>
        
        <button onClick={loadTransactions} className={styles.refreshButton}>
          🔄 Atualizar
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className={`${styles.content} ${viewMode === 'form' ? styles.formOnly : ''} ${viewMode === 'list' ? styles.listOnly : ''}`}>
        {/* Formulário */}
        {(viewMode === 'both' || viewMode === 'form') && (
          <div className={styles.formSection}>
            <TransactionForm onSuccess={loadTransactions} />
          </div>
        )}

        {/* Lista */}
        {(viewMode === 'both' || viewMode === 'list') && (
          <div className={styles.listSection}>
            <TransactionList 
              transactions={transactions} 
              onDelete={loadTransactions}
            />
          </div>
        )}
      </div>

      {/* Ações rápidas */}
      <div className={styles.quickActions}>
        <div className={styles.actionCard}>
          <h3>💡 Dicas rápidas</h3>
          <ul>
            <li>Registre todas as transações imediatamente</li>
            <li>Categorize corretamente para melhores análises</li>
            <li>Revise suas despesas semanalmente</li>
            <li>Estabeleça metas de economia realistas</li>
          </ul>
        </div>
        
        <div className={styles.actionCard}>
          <h3>⚡ Ações rápidas</h3>
          <div className={styles.actionButtons}>
            <button 
              onClick={() => setViewMode('form')}
              className={styles.actionButton}
            >
              ➕ Adicionar transação
            </button>
            <button 
              onClick={loadTransactions}
              className={styles.actionButton}
            >
              🔄 Recarregar lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}