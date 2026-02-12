'use client';

import { useState, useMemo } from 'react';
import { Transaction, CATEGORIES } from '@/app/types/transaction';
import { deleteTransaction } from '@/app/lib/supabase/db';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import styles from './TransactionList.module.css';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: () => void;
}

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Deleta uma transação
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação permanentemente?')) {
      return;
    }

    setDeletingId(id);
    try {
      const success = await deleteTransaction(id);
      if (success) {
        if (onDelete) {
          onDelete();
        }
      } else {
        alert('❌ Erro ao excluir transação');
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('❌ Erro ao excluir transação');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtra e ordena transações
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtro por categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(term) ||
        getCategoryName(t.category, t.type).toLowerCase().includes(term)
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'description') {
        comparison = a.description.localeCompare(b.description);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, filterType, filterCategory, sortBy, sortOrder, searchTerm]);

  // Calcula totais
  const totals = useMemo(() => {
    const income = filteredAndSortedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredAndSortedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      count: filteredAndSortedTransactions.length
    };
  }, [filteredAndSortedTransactions]);

  // Obtém nome e cor da categoria
  const getCategoryInfo = (categoryId: string, type: 'income' | 'expense') => {
    const categoryList = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
    const category = categoryList.find(cat => cat.id === categoryId);
    return category || { name: 'Não categorizado', color: '#666' };
  };

  const getCategoryName = (categoryId: string, type: 'income' | 'expense') => {
    return getCategoryInfo(categoryId, type).name;
  };

  // Formata data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Formata valor
  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    return `${type === 'income' ? '+' : '-'} R$ ${amount.toFixed(2)}`;
  };

  if (transactions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h3>Nenhuma transação encontrada</h3>
          <p>Comece adicionando sua primeira transação usando o formulário ao lado.</p>
          <Link href="/transactions?view=form" className={styles.emptyButton}>
            ➕ Adicionar Transação
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Cabeçalho com estatísticas */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>
            📋 Lista de Transações
            <span className={styles.count}>
              {filteredAndSortedTransactions.length} de {transactions.length}
            </span>
          </h2>
          
          {/* Busca */}
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button 
                className={styles.clearSearch}
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Cards de totais */}
        <div className={styles.totals}>
          <div className={`${styles.totalCard} ${styles.income}`}>
            <div className={styles.totalIcon}>📈</div>
            <div className={styles.totalInfo}>
              <span className={styles.totalLabel}>Receitas</span>
              <span className={styles.totalValue}>
                R$ {totals.income.toFixed(2)}
              </span>
            </div>
          </div>
          <div className={`${styles.totalCard} ${styles.expense}`}>
            <div className={styles.totalIcon}>📉</div>
            <div className={styles.totalInfo}>
              <span className={styles.totalLabel}>Despesas</span>
              <span className={styles.totalValue}>
                R$ {totals.expense.toFixed(2)}
              </span>
            </div>
          </div>
          <div className={`${styles.totalCard} ${styles.balance}`}>
            <div className={styles.totalIcon}>⚖️</div>
            <div className={styles.totalInfo}>
              <span className={styles.totalLabel}>Saldo</span>
              <span className={`${styles.totalValue} ${totals.balance >= 0 ? styles.positive : styles.negative}`}>
                R$ {totals.balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Filtros e ordenação */}
        <div className={styles.filters}>
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
            <div className={styles.selectWrapper}>
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
              <span className={styles.selectArrow}>▼</span>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Ordenar por:</label>
            <div className={styles.sortButtons}>
              <button
                className={`${styles.sortButton} ${sortBy === 'date' ? styles.active : ''}`}
                onClick={() => {
                  if (sortBy === 'date') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('date');
                    setSortOrder('desc');
                  }
                }}
              >
                Data {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                className={`${styles.sortButton} ${sortBy === 'amount' ? styles.active : ''}`}
                onClick={() => {
                  if (sortBy === 'amount') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('amount');
                    setSortOrder('desc');
                  }
                }}
              >
                Valor {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                className={`${styles.sortButton} ${sortBy === 'description' ? styles.active : ''}`}
                onClick={() => {
                  if (sortBy === 'description') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('description');
                    setSortOrder('asc');
                  }
                }}
              >
                Descrição {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de transações */}
      {filteredAndSortedTransactions.length === 0 ? (
        <div className={styles.noResults}>
          <p>🔍 Nenhuma transação encontrada com os filtros selecionados</p>
          <button 
            onClick={() => {
              setFilterType('all');
              setFilterCategory('all');
              setSearchTerm('');
            }}
            className={styles.clearFiltersButton}
          >
            Limpar filtros
          </button>
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
              {filteredAndSortedTransactions.map((transaction) => {
                const categoryInfo = getCategoryInfo(transaction.category, transaction.type);
                const formattedDate = formatDate(transaction.date);
                const isDeleting = deletingId === transaction.id;

                return (
                  <tr key={transaction.id} className={`${styles.tableRow} ${isDeleting ? styles.deleting : ''}`}>
                    <td className={styles.dateCell}>
                      <span className={styles.dateDay}>
                        {formattedDate.split('/')[0]}
                      </span>
                      <span className={styles.dateMonth}>
                        {formattedDate.split('/')[1]}
                      </span>
                      <span className={styles.dateYear}>
                        {formattedDate.split('/')[2]}
                      </span>
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
                          color: categoryInfo.color,
                          borderColor: categoryInfo.color
                        }}
                      >
                        <span className={styles.categoryDot} style={{ backgroundColor: categoryInfo.color }}></span>
                        {categoryInfo.name}
                      </span>
                    </td>
                    <td className={styles.typeCell}>
                      <span className={`${styles.typeBadge} ${transaction.type === 'income' ? styles.incomeBadge : styles.expenseBadge}`}>
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className={`${styles.amountCell} ${transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount}`}>
                      <span className={styles.amountSign}>
                        {transaction.type === 'income' ? '+' : '-'}
                      </span>
                      R$ {transaction.amount.toFixed(2)}
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className={styles.deleteButton}
                        disabled={isDeleting}
                        title="Excluir transação"
                      >
                        {isDeleting ? (
                          <span className={styles.spinner}></span>
                        ) : (
                          '🗑️'
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rodapé com resumo */}
      <div className={styles.footer}>
        <div className={styles.summary}>
          <p>
            <strong>{filteredAndSortedTransactions.length}</strong> transações exibidas
            {filteredAndSortedTransactions.length !== transactions.length && (
              <> de <strong>{transactions.length}</strong> total</>
            )}
          </p>
          <p className={styles.balanceSummary}>
            Saldo do período: 
            <span className={totals.balance >= 0 ? styles.positive : styles.negative}>
              R$ {totals.balance.toFixed(2)}
            </span>
          </p>
        </div>
        
        {filteredAndSortedTransactions.length > 0 && (
          <button 
            onClick={() => {
              if (confirm('Exportar estas transações para CSV?')) {
                exportToCSV(filteredAndSortedTransactions);
              }
            }}
            className={styles.exportButton}
          >
            📥 Exportar CSV
          </button>
        )}
      </div>
    </div>
  );
}

// Função auxiliar para exportar CSV
function exportToCSV(transactions: Transaction[]) {
  const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];
  const rows = transactions.map(t => [
    format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR }),
    t.description,
    getCategoryName(t.category, t.type),
    t.type === 'income' ? 'Receita' : 'Despesa',
    t.amount.toFixed(2)
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transacoes-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Helper function para nome da categoria (necessário para exportação)
function getCategoryName(categoryId: string, type: 'income' | 'expense'): string {
  const categoryList = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
  const category = categoryList.find(cat => cat.id === categoryId);
  return category?.name || 'Não categorizado';
}