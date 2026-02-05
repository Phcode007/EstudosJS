
export type TransactionType = 'income' | 'expense';

export const CATEGORIES = {
  income: [
    { id: 'salary', name: 'Salário', color: '#10B981' },
    { id: 'freelance', name: 'Freelance', color: '#3B82F6' },
    { id: 'investment', name: 'Investimentos', color: '#8B5CF6' },
    { id: 'gift', name: 'Presente', color: '#EC4899' },
    { id: 'other_income', name: 'Outra Receita', color: '#6B7280' },
  ],
  expense: [
    { id: 'food', name: 'Alimentação', color: '#EF4444' },
    { id: 'transport', name: 'Transporte', color: '#F59E0B' },
    { id: 'housing', name: 'Moradia', color: '#6366F1' },
    { id: 'entertainment', name: 'Lazer', color: '#8B5CF6' },
    { id: 'health', name: 'Saúde', color: '#10B981' },
    { id: 'education', name: 'Educação', color: '#3B82F6' },
    { id: 'shopping', name: 'Compras', color: '#EC4899' },
    { id: 'other_expense', name: 'Outra Despesa', color: '#6B7280' },
  ],
} as const;

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  created_at?: string;
}

export type CreateTransactionData = Omit<Transaction, 'id'>;

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id'>;
        Update: Partial<Omit<Transaction, 'id'>>;
      };
    };
  };
}

export interface CategoryChartData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyChartData {
  month: string;
  income: number;
  expense: number;
}

export interface TransactionStats {
  totalTransactions: number;
  averageTransaction: number;
  largestIncome: number;
  largestExpense: number;
  mostUsedCategory: string;
}