'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/app/types/transaction';
import { getTransactions, getBalance } from '@/app/lib/supabase/db';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './page.module.css';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'year'>('month');
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'export'>('summary');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, balanceData] = await Promise.all([
        getTransactions(),
        getBalance()
      ]);
      
      // Filtrar por período
      let filteredTransactions = transactionsData;
      const now = new Date();
      
      if (dateRange === 'month') {
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        filteredTransactions = transactionsData.filter(t => {
          const date = new Date(t.date);
          return date >= start && date <= end;
        });
      } else if (dateRange === 'year') {
        const start = subMonths(now, 12);
        filteredTransactions = transactionsData.filter(t => {
          const date = new Date(t.date);
          return date >= start;
        });
      }
      
      setTransactions(filteredTransactions);
      setBalance(balanceData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];
    const rows = transactions.map(t => [
      format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR }),
      t.description,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount.toFixed(2)
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const exportToPDF = () => {
    // Implementação básica - em produção usar biblioteca como jsPDF
    alert('Exportação para PDF em desenvolvimento! Por enquanto, use CSV.');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando relatório...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>📋 Relatórios Financeiros</h1>
        <p className={styles.subtitle}>
          Análises detalhadas e exportação de dados
        </p>
      </header>

      <div className={styles.content}>
        {/* Controles do relatório */}
        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label>Período:</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${dateRange === 'all' ? styles.active : ''}`}
                onClick={() => setDateRange('all')}
              >
                Todos
              </button>
              <button
                className={`${styles.filterButton} ${dateRange === 'month' ? styles.active : ''}`}
                onClick={() => setDateRange('month')}
              >
                Este mês
              </button>
              <button
                className={`${styles.filterButton} ${dateRange === 'year' ? styles.active : ''}`}
                onClick={() => setDateRange('year')}
              >
                Último ano
              </button>
            </div>
          </div>

          <div className={styles.reportTypeGroup}>
            <label>Tipo de Relatório:</label>
            <div className={styles.reportButtons}>
              <button
                className={`${styles.reportButton} ${reportType === 'summary' ? styles.active : ''}`}
                onClick={() => setReportType('summary')}
              >
                📊 Resumo
              </button>
              <button
                className={`${styles.reportButton} ${reportType === 'detailed' ? styles.active : ''}`}
                onClick={() => setReportType('detailed')}
              >
                📋 Detalhado
              </button>
              <button
                className={`${styles.reportButton} ${reportType === 'export' ? styles.active : ''}`}
                onClick={() => setReportType('export')}
              >
                📤 Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Resumo do período */}
        <div className={styles.periodSummary}>
          <h3>📅 Período Selecionado</h3>
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Total de Transações</div>
              <div className={styles.summaryValue}>{transactions.length}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Receitas Totais</div>
              <div className={`${styles.summaryValue} ${styles.income}`}>
                R$ {balance.income.toFixed(2)}
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Despesas Totais</div>
              <div className={`${styles.summaryValue} ${styles.expense}`}>
                R$ {balance.expense.toFixed(2)}
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Saldo</div>
              <div className={`${styles.summaryValue} ${balance.balance >= 0 ? styles.positive : styles.negative}`}>
                R$ {balance.balance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo do relatório baseado no tipo */}
        {reportType === 'summary' && (
          <div className={styles.reportContent}>
            <h3>📊 Resumo Financeiro</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summarySection}>
                <h4>📈 Análise de Receitas</h4>
                <div className={styles.analysisItem}>
                  <span>Média por receita:</span>
                  <span>R$ {(balance.income / transactions.filter(t => t.type === 'income').length || 0).toFixed(2)}</span>
                </div>
                <div className={styles.analysisItem}>
                  <span>Maior receita:</span>
                  <span>R$ {Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount), 0).toFixed(2)}</span>
                </div>
                <div className={styles.analysisItem}>
                  <span>Menor receita:</span>
                  <span>R$ {Math.min(...transactions.filter(t => t.type === 'income').map(t => t.amount), 0).toFixed(2)}</span>
                </div>
              </div>
              
              <div className={styles.summarySection}>
                <h4>📉 Análise de Despesas</h4>
                <div className={styles.analysisItem}>
                  <span>Média por despesa:</span>
                  <span>R$ {(balance.expense / transactions.filter(t => t.type === 'expense').length || 0).toFixed(2)}</span>
                </div>
                <div className={styles.analysisItem}>
                  <span>Maior despesa:</span>
                  <span>R$ {Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount), 0).toFixed(2)}</span>
                </div>
                <div className={styles.analysisItem}>
                  <span>Menor despesa:</span>
                  <span>R$ {Math.min(...transactions.filter(t => t.type === 'expense').map(t => t.amount), 0).toFixed(2)}</span>
                </div>
              </div>
              
              <div className={styles.summarySection}>
                <h4>🎯 Insights</h4>
                <div className={styles.insight}>
                  <p><strong>Saldo do período:</strong> {balance.balance >= 0 ? 'Positivo' : 'Negativo'}</p>
                  <p><strong>Taxa de economia:</strong> {balance.income > 0 ? `${((balance.balance / balance.income) * 100).toFixed(1)}%` : '0%'}</p>
                  <p><strong>Recomendação:</strong> {balance.balance >= 0 ? 'Continue mantendo o controle!' : 'Revise suas despesas.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'detailed' && (
          <div className={styles.reportContent}>
            <h3>📋 Relatório Detalhado</h3>
            <div className={styles.tableContainer}>
              <table className={styles.detailedTable}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.noData}>
                        Nenhuma transação encontrada para o período selecionado.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className={styles.tableRow}>
                        <td>{format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</td>
                        <td>{transaction.description}</td>
                        <td>{transaction.category}</td>
                        <td>
                          <span className={`${styles.typeBadge} ${transaction.type === 'income' ? styles.incomeBadge : styles.expenseBadge}`}>
                            {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className={transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount}>
                          {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className={styles.totalLabel}>Total</td>
                    <td className={styles.totalAmount}>
                      R$ {balance.balance.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {reportType === 'export' && (
          <div className={styles.reportContent}>
            <h3>📤 Exportar Dados</h3>
            <div className={styles.exportOptions}>
              <div className={styles.exportCard}>
                <h4>📄 Exportar para CSV</h4>
                <p>Exporte todas as transações para um arquivo CSV que pode ser aberto no Excel ou Google Sheets.</p>
                <button onClick={exportToCSV} className={styles.exportButton}>
                  📥 Baixar CSV
                </button>
              </div>
              
              <div className={styles.exportCard}>
                <h4>📊 Exportar para PDF</h4>
                <p>Gere um relatório em PDF com formatação profissional.</p>
                <button onClick={exportToPDF} className={styles.exportButton}>
                  📥 Gerar PDF
                </button>
              </div>
              
              <div className={styles.exportCard}>
                <h4>🔄 Sincronizar</h4>
                <p>Mantenha seus dados atualizados sincronizando com a nuvem.</p>
                <button onClick={loadData} className={styles.exportButton}>
                  🔄 Atualizar Dados
                </button>
              </div>
            </div>
            
            <div className={styles.exportInfo}>
              <h4>ℹ️ Informações sobre Exportação</h4>
              <ul>
                <li>CSV é o formato recomendado para análise em planilhas</li>
                <li>PDF é ideal para compartilhamento e impressão</li>
                <li>Sempre verifique os dados antes de exportar</li>
                <li>Mantenha backups regulares dos seus dados</li>
              </ul>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className={styles.actions}>
          <button onClick={loadData} className={styles.refreshButton}>
            🔄 Atualizar Relatório
          </button>
          <button onClick={exportToCSV} className={styles.primaryButton}>
            📤 Exportar Todos os Dados
          </button>
        </div>
      </div>
    </div>
  );
}