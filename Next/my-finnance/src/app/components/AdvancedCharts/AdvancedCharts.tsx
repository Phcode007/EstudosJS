'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getTransactions } from '@/app/lib/supabase/db';
import { Transaction, CATEGORIES } from '@/app/types/transaction';
import styles from './AdvancedCharts.module.css';

export default function AdvancedCharts() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'area' | 'radar' | 'donut'>('area');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Processa dados para gráficos
  const processChartData = () => {
    if (transactions.length === 0) return { areaData: [], radarData: [], donutData: [] };

    // Dados para área (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        income: 0,
        expense: 0
      };
    }).reverse();

    transactions.forEach(t => {
      const date = new Date(t.date);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 7) {
        if (t.type === 'income') {
          last7Days[diffDays].income += t.amount;
        } else {
          last7Days[diffDays].expense += t.amount;
        }
      }
    });

    // Dados para radar (categorias)
    const radarData = CATEGORIES.expense.slice(0, 6).map(cat => {
      const total = transactions
        .filter(t => t.category === cat.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        category: cat.name,
        value: total,
        fullMark: Math.max(total * 2, 1000) // Escala dinâmica
      };
    });

    // Dados para donut (tipos de transação)
    const incomeTotal = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenseTotal = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const donutData = [
      { name: 'Receitas', value: incomeTotal, color: '#10B981' },
      { name: 'Despesas', value: expenseTotal, color: '#F31260' }
    ];

    return {
      areaData: last7Days,
      radarData: radarData.filter(d => d.value > 0),
      donutData: donutData.filter(d => d.value > 0)
    };
  };

  const { areaData, radarData, donutData } = processChartData();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando gráficos avançados...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📊 Gráficos Avançados</h3>
        <div className={styles.chartSelector}>
          <button
            className={`${styles.chartButton} ${activeChart === 'area' ? styles.active : ''}`}
            onClick={() => setActiveChart('area')}
          >
            📈 Área
          </button>
          <button
            className={`${styles.chartButton} ${activeChart === 'radar' ? styles.active : ''}`}
            onClick={() => setActiveChart('radar')}
          >
            🎯 Radar
          </button>
          <button
            className={`${styles.chartButton} ${activeChart === 'donut' ? styles.active : ''}`}
            onClick={() => setActiveChart('donut')}
          >
            🍩 Donut
          </button>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {activeChart === 'area' && (
          <>
            <h4 className={styles.chartTitle}>Evolução Diária (Últimos 7 dias)</h4>
            <div className={styles.chartWrapper}>
              {areaData.length > 0 && areaData.some(d => d.income > 0 || d.expense > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      name="Receitas" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      name="Despesas" 
                      stroke="#F31260" 
                      fill="#F31260" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.noData}>
                  <p>📭 Sem dados dos últimos 7 dias</p>
                  <p>Adicione transações recentes para ver este gráfico</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeChart === 'radar' && (
          <>
            <h4 className={styles.chartTitle}>Distribuição por Categoria (Despesas)</h4>
            <div className={styles.chartWrapper}>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Despesas"
                      dataKey="value"
                      stroke="#F31260"
                      fill="#F31260"
                      fillOpacity={0.3}
                    />
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.noData}>
                  <p>📭 Sem dados de despesas por categoria</p>
                  <p>Adicione despesas categorizadas para ver este gráfico</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeChart === 'donut' && (
          <>
            <h4 className={styles.chartTitle}>Proporção Receitas vs Despesas</h4>
            <div className={styles.chartWrapper}>
              {donutData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.noData}>
                  <p>📭 Sem dados para comparar</p>
                  <p>Adicione receitas e despesas para ver este gráfico</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.legend}>
        {activeChart === 'area' && (
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#10B981' }}></span>
              <span>Receitas</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#F31260' }}></span>
              <span>Despesas</span>
            </div>
          </div>
        )}
        
        <div className={styles.summary}>
          <p>Total de transações: <strong>{transactions.length}</strong></p>
          <p>Use estes gráficos para identificar padrões e oportunidades de economia.</p>
        </div>
      </div>
    </div>
  );
}