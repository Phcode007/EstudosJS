// src/app/lib/chart-data.ts
'use server';

import { Transaction, CATEGORIES, CategoryChartData, MonthlyChartData, TransactionStats } from '@/app/types/transaction';
import { getTransactions } from './supabase/db';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Obtém dados para gráfico de categorias
export async function getCategoryChartData(): Promise<CategoryChartData[]> {
  const transactions = await getTransactions();
  
  // Agrupa por categoria
  const categoryMap = new Map<string, number>();
  
  transactions.forEach(transaction => {
    const current = categoryMap.get(transaction.category) || 0;
    categoryMap.set(transaction.category, current + transaction.amount);
  });
  
  // Converte para array e formata
  const data: CategoryChartData[] = [];
  
  categoryMap.forEach((value, categoryId) => {
    // Encontra a categoria nos arrays
    let categoryName = 'Desconhecida';
    let categoryColor = '#666';
    
    // Procura em income categories
    const incomeCat = CATEGORIES.income.find(cat => cat.id === categoryId);
    if (incomeCat) {
      categoryName = incomeCat.name;
      categoryColor = incomeCat.color;
    }
    
    // Procura em expense categories
    const expenseCat = CATEGORIES.expense.find(cat => cat.id === categoryId);
    if (expenseCat) {
      categoryName = expenseCat.name;
      categoryColor = expenseCat.color;
    }
    
    data.push({
      name: categoryName,
      value: Math.abs(value),
      color: categoryColor
    });
  });
  
  // Ordena por valor (decrescente) e limita a 8 categorias
  return data
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

// Obtém dados para gráfico mensal (últimos 6 meses)
export async function getMonthlyChartData(): Promise<MonthlyChartData[]> {
  const transactions = await getTransactions();
  
  // Define o intervalo dos últimos 6 meses
  const endDate = new Date();
  const startDate = subMonths(endDate, 5); // 6 meses (0-5)
  
  // Cria array de meses
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  
  // Inicializa dados mensais
  const monthlyData: { [key: string]: { income: number; expense: number } } = {};
  
  months.forEach(month => {
    const monthKey = format(month, 'yyyy-MM');
    monthlyData[monthKey] = { income: 0, expense: 0 };
  });
  
  // Processa transações
  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const monthKey = format(transactionDate, 'yyyy-MM');
    
    if (monthlyData[monthKey]) {
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
    }
  });
  
  // Converte para array formatada
  return months.map(month => {
    const monthKey = format(month, 'yyyy-MM');
    const data = monthlyData[monthKey];
    
    return {
      month: format(month, 'MMM', { locale: ptBR }),
      income: data?.income || 0,
      expense: data?.expense || 0
    };
  });
}

// Obtém estatísticas
export async function getTransactionStats(): Promise<TransactionStats> {
  const transactions = await getTransactions();
  
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      averageTransaction: 0,
      largestIncome: 0,
      largestExpense: 0,
      mostUsedCategory: 'Nenhuma'
    };
  }
  
  // Calcula estatísticas
  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const averageTransaction = totalAmount / transactions.length;
  
  const largestIncome = incomes.length > 0 
    ? Math.max(...incomes.map(t => t.amount))
    : 0;
    
  const largestExpense = expenses.length > 0
    ? Math.max(...expenses.map(t => t.amount))
    : 0;
  
  // Encontra categoria mais usada
  const categoryCount = new Map<string, number>();
  transactions.forEach(t => {
    const count = categoryCount.get(t.category) || 0;
    categoryCount.set(t.category, count + 1);
  });
  
  let mostUsedCategory = 'Nenhuma';
  let maxCount = 0;
  
  categoryCount.forEach((count, categoryId) => {
    if (count > maxCount) {
      maxCount = count;
      // Encontra nome da categoria
      const incomeCat = CATEGORIES.income.find(cat => cat.id === categoryId);
      const expenseCat = CATEGORIES.expense.find(cat => cat.id === categoryId);
      mostUsedCategory = incomeCat?.name || expenseCat?.name || categoryId;
    }
  });
  
  return {
    totalTransactions: transactions.length,
    averageTransaction,
    largestIncome,
    largestExpense,
    mostUsedCategory
  };
}