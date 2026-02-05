// src/app/components/Charts/Charts.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { CategoryChartData, MonthlyChartData, TransactionStats } from '@/app/types/transaction';
import { getCategoryChartData, getMonthlyChartData, getTransactionStats } from '@/app/lib/chart-data';
import styles from './Charts.module.css';

export default function Charts() {
  const [categoryData, setCategoryData] = useState<CategoryChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyChartData[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'categories' | 'monthly' | 'trend'>('categories');

  const loadChartData = async () => {
    try {
      setLoading(true);
      const [categoryData, monthlyData, statsData] = await Promise.all([
        getCategoryChartData(),
        getMonthlyChartData(),
        getTransactionStats()
      ]);
      
      setCategoryData(categoryData);
      setMonthlyData(monthlyData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  // Cores personalizadas para o gráfico de pizza
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando gráficos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h2 className={styles.title}>📊 Análises Gráficas</h2>
        <div className={styles.chartSelector}>
          <button
            className={`${styles.chartButton} ${activeChart === 'categories' ? styles.active : ''}`}
            onClick={() => setActiveChart('categories')}
          >
            🏷️ Por Categoria
          </button>
          <button
            className={`${styles.chartButton} ${activeChart === 'monthly' ? styles.active : ''}`}
            onClick={() => setActiveChart('monthly')}
          >
            📅 Mensal
          </button>
          <button
            className={`${styles.chartButton} ${activeChart === 'trend' ? styles.active : ''}`}
            onClick={() => setActiveChart('trend')}
          >
            📈 Tendência
          </button>
        </div>
        <button onClick={loadChartData} className={styles.refreshButton}>
          🔄 Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Total de Transações</div>
              <div className={styles.statValue}>{stats.totalTransactions}</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Média por Transação</div>
              <div className={styles.statValue}>R$ {stats.averageTransaction.toFixed(2)}</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Maior Receita</div>
              <div className={styles.statValue}>R$ {stats.largestIncome.toFixed(2)}</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📉</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Maior Despesa</div>
              <div className={styles.statValue}>R$ {stats.largestExpense.toFixed(2)}</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏷️</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Categoria Mais Usada</div>
              <div className={styles.statValue}>{stats.mostUsedCategory}</div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className={styles.chartsGrid}>
        {/* Gráfico ativo */}
        <div className={styles.chartContainer}>
          {activeChart === 'categories' && (
            <>
              <h3 className={styles.chartTitle}>Distribuição por Categoria</h3>
              <div className={styles.chartWrapper}>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.noData}>
                    <p>📭 Sem dados para exibir no gráfico</p>
                    <p>Adicione transações para ver a distribuição por categoria</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeChart === 'monthly' && (
            <>
              <h3 className={styles.chartTitle}>Receitas vs Despesas (Últimos 6 meses)</h3>
              <div className={styles.chartWrapper}>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
                      />
                      <Legend />
                      <Bar dataKey="income" name="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Despesas" fill="#F31260" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.noData}>
                    <p>📭 Sem dados para exibir no gráfico</p>
                    <p>Adicione transações para ver a evolução mensal</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeChart === 'trend' && (
            <>
              <h3 className={styles.chartTitle}>Tendência Mensal</h3>
              <div className={styles.chartWrapper}>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        name="Receitas" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expense" 
                        name="Despesas" 
                        stroke="#F31260" 
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.noData}>
                    <p>📭 Sem dados para exibir no gráfico</p>
                    <p>Adicione transações para ver a tendência</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Lista de categorias (lado direito) */}
        <div className={styles.categoriesList}>
          <h3 className={styles.listTitle}>🏷️ Top Categorias</h3>
          {categoryData.length > 0 ? (
            <ul className={styles.categories}>
              {categoryData.map((item, index) => (
                <li key={index} className={styles.categoryItem}>
                  <div className={styles.categoryColor} style={{ backgroundColor: item.color }}></div>
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>{item.name}</span>
                    <span className={styles.categoryValue}>R$ {item.value.toFixed(2)}</span>
                  </div>
                  <div className={styles.categoryPercentage}>
                    {((item.value / categoryData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.noDataSmall}>
              <p>Nenhuma categoria com dados</p>
            </div>
          )}
          
          {/* Dicas */}
          <div className={styles.tips}>
            <h4>💡 Dicas Financeiras</h4>
            <ul>
              <li>Registre todas as transações</li>
              <li>Categorize corretamente seus gastos</li>
              <li>Revise suas despesas mensalmente</li>
              <li>Estabeleça metas de economia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}