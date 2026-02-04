'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TransactionType, CATEGORIES } from '@/app/types/transaction';
import { addTransaction } from '@/app/lib/supabase/db';
import styles from './TransactionForm.module.css';

const transactionSchema = z.object({
  description: z.string().min(3, 'Descrição muito curta').max(100, 'Descrição muito longa'),
  amount: z.number().positive('Valor deve ser positivo').min(0.01, 'Valor mínimo: 0.01'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Selecione uma categoria'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data inválida',
  }),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function TransactionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const result = await addTransaction(data);
      
      if (result) {
        setSuccessMessage('Transação adicionada com sucesso!');
        reset({
          description: '',
          amount: 0,
          type: selectedType,
          category: '',
          date: new Date().toISOString().split('T')[0],
        });
        
        // Limpa a mensagem após 3 segundos
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Erro ao adicionar transação');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Erro ao processar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = selectedType === 'income' 
    ? CATEGORIES.income 
    : CATEGORIES.expense;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>➕ Adicionar Transação</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Tipo (Receita/Despesa) */}
        <div className={styles.typeSelector}>
          <button
            type="button"
            className={`${styles.typeButton} ${selectedType === 'income' ? styles.active : ''}`}
            onClick={() => {
              reset({
                ...watch(),
                type: 'income',
                category: '',
              });
            }}
          >
            <span className={styles.typeIcon}>💰</span>
            <span>Receita</span>
          </button>
          <button
            type="button"
            className={`${styles.typeButton} ${selectedType === 'expense' ? styles.active : ''}`}
            onClick={() => {
              reset({
                ...watch(),
                type: 'expense',
                category: '',
              });
            }}
          >
            <span className={styles.typeIcon}>💸</span>
            <span>Despesa</span>
          </button>
        </div>

        {/* Descrição */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Descrição
          </label>
          <input
            id="description"
            type="text"
            placeholder="Ex: Salário, Supermercado, etc."
            className={`${styles.input} ${errors.description ? styles.error : ''}`}
            {...register('description')}
          />
          {errors.description && (
            <span className={styles.errorMessage}>{errors.description.message}</span>
          )}
        </div>

        {/* Valor */}
        <div className={styles.formGroup}>
          <label htmlFor="amount" className={styles.label}>
            Valor (R$)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            className={`${styles.input} ${errors.amount ? styles.error : ''}`}
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <span className={styles.errorMessage}>{errors.amount.message}</span>
          )}
        </div>

        {/* Categoria */}
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Categoria
          </label>
          <select
            id="category"
            className={`${styles.select} ${errors.category ? styles.error : ''}`}
            {...register('category')}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className={styles.errorMessage}>{errors.category.message}</span>
          )}
        </div>

        {/* Data */}
        <div className={styles.formGroup}>
          <label htmlFor="date" className={styles.label}>
            Data
          </label>
          <input
            id="date"
            type="date"
            className={`${styles.input} ${errors.date ? styles.error : ''}`}
            {...register('date')}
          />
          {errors.date && (
            <span className={styles.errorMessage}>{errors.date.message}</span>
          )}
        </div>

        {/* Botão de envio */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner}></span>
              Processando...
            </>
          ) : (
            'Adicionar Transação'
          )}
        </button>

        {/* Mensagens de feedback */}
        {successMessage && (
          <div className={styles.successMessage}>
            ✅ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className={styles.errorMessageContainer}>
            ❌ {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}