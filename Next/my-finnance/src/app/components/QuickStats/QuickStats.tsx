'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTransactionStats } from '@/app/lib/chart-data';
import { TransactionStats } from '@/app/types/transaction';
import styles from './QuickStats.module.css';

export default function QuickStats() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getTransactionStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>❌ Erro ao carregar estatísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📈 Estatísticas Rápidas</h3>
        <Link href="/statistics" className={styles.viewMoreLink}>
          Ver gráficos completos →
        </Link>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalTransactions}</div>
            <div className={styles.statLabel}>Transações</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>R$ {stats.averageTransaction.toFixed(2)}</div>
            <div className={styles.statLabel}>Média por transação</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>R$ {stats.largestIncome.toFixed(2)}</div>
            <div className={styles.statLabel}>Maior receita</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statIcon}>📉</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>R$ {stats.largestExpense.toFixed(2)}</div>
            <div className={styles.statLabel}>Maior despesa</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statIcon}>🏷️</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.mostUsedCategory}</div>
            <div className={styles.statLabel}>Categoria mais usada</div>
          </div>
        </div>
      </div>
      
      <div className={styles.tip}>
        💡 <strong>Dica:</strong> Acesse a página de estatísticas para análises detalhadas com gráficos interativos.
      </div>
    </div>
  );
}