'use server';

import { Transaction, CreateTransactionData } from '@/app/types/transaction';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cria um cliente Supabase no servidor
async function createSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // O cookie foi setado em uma Server Action
            // Isso é ok para Server Components
          }
        },
      },
    }
  );
}

// Server Actions para manipular transações
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

// Funções auxiliares
export async function getBalance(): Promise<{
  income: number;
  expense: number;
  balance: number;
}> {
  const supabase = await createSupabaseClient();
  
  // Busca receitas
  const { data: incomeData, error: incomeError } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'income');

  // Busca despesas
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