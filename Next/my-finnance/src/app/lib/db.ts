'use server';

import { createClient } from '@/app/lib/supabase/client';
import { Transaction, CreateTransactionData } from '@/app/types/transactions';
import { revalidatePath } from 'next/cache';

async function createSupabaseClient() {
  const { createClient } = await import('@supabase/ssr');
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getTransactions(): Promise<Transaction[]> {
  const supabase = await createSupabaseClient();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data || [];
}

export async function addTransaction(data: CreateTransactionData): Promise<Transaction | null> {
  const supabase = await createSupabaseClient();
  
  const { data: newTransaction, error } = await supabase
    .from('transactions')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }

  // Revalida a página para atualizar o cache
  revalidatePath('/transactions');
  revalidatePath('/');
  
  return newTransaction;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const supabase = await createSupabaseClient();
  
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }

  revalidatePath('/transactions');
  revalidatePath('/');
  
  return true;
}

export async function getBalance(): Promise<{
  income: number;
  expense: number;
  balance: number;
}> {
  const supabase = await createSupabaseClient();
  
  const { data: incomeData, error: incomeError } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'income');

  const { data: expenseData, error: expenseError } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'expense');

  if (incomeError || expenseError) {
    console.error('Error calculating balance:', incomeError || expenseError);
    return { income: 0, expense: 0, balance: 0 };
  }

  const income = incomeData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const expense = expenseData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  return {
    income,
    expense,
    balance: income - expense
  };
}

export async function getRecentTransactions(limit: number = 5): Promise<Transaction[]> {
  const supabase = await createSupabaseClient();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }

  return data || [];
}