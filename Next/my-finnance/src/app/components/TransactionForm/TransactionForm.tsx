// src/app/components/TransactionForm/TransactionForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TransactionType, CATEGORIES } from '@/app/types/transaction';
import { addTransaction } from '@/app/lib/supabase/db';
import styles from './TransactionForm.module.css';

// Interface para as props
interface TransactionFormProps {
  onSuccess?: () => void;
}

// Schema de validação
const transactionSchema = z.object({
  description: z.string()
    .min(3, 'Descrição muito curta (mínimo 3 caracteres)')
    .max(100, 'Descrição muito longa (máximo 100 caracteres)'),
  amount: z.number()
    .positive('Valor deve ser positivo')
    .min(0.01, 'Valor mínimo: R$ 0,01')
    .max(999999.99, 'Valor máximo: R$ 999.999,99'),
  type: z.enum(['income', 'expense']),
  category: z.string()
    .min(1, 'Selecione uma categoria'),
  date: z.string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Data inválida',
    }),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
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
  const watchAmount = watch('amount');
  const categories = selectedType === 'income' 
    ? CATEGORIES.income 
    : CATEGORIES.expense;

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const result = await addTransaction(data);
      
      if (result) {
        setSuccessMessage('✅ Transação adicionada com sucesso!');
        
        // Reset do formulário
        reset({
          description: '',
          amount: 0,
          type: selectedType,
          category: '',
          date: new Date().toISOString().split('T')[0],
        });
        
        // Chama callback de sucesso se existir
        if (onSuccess) {
          onSuccess();
        }
        
        // Limpa a mensagem após 5 segundos
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage('❌ Erro ao adicionar transação. Tente novamente.');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      setErrorMessage('❌ Erro ao processar transação. Verifique sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formata o valor enquanto digita
  const formatAmount = (value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    // Converte para número decimal
    const decimalValue = parseFloat(numericValue) / 100;
    return isNaN(decimalValue) ? 0 : decimalValue;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>➕ Adicionar Nova Transação</h2>
        <p className={styles.description}>
          Registre suas receitas e despesas para manter o controle financeiro
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Tipo (Receita/Despesa) */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Tipo de Transação</label>
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
              <span className={styles.typeLabel}>Receita</span>
              <span className={styles.typeDescription}>Entrada de dinheiro</span>
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
              <span className={styles.typeLabel}>Despesa</span>
              <span className={styles.typeDescription}>Saída de dinheiro</span>
            </button>
          </div>
        </div>

        {/* Descrição */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Descrição
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="description"
              type="text"
              placeholder="Ex: Salário mensal, Supermercado, Conta de luz..."
              className={`${styles.input} ${errors.description ? styles.error : ''}`}
              {...register('description')}
              maxLength={100}
            />
            {watch('description') && (
              <span className={styles.charCount}>
                {watch('description').length}/100
              </span>
            )}
          </div>
          {errors.description && (
            <span className={styles.errorMessage}>
              ⚠️ {errors.description.message}
            </span>
          )}
        </div>

        {/* Valor */}
        <div className={styles.formGroup}>
          <label htmlFor="amount" className={styles.label}>
            Valor (R$)
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.currencySymbol}>R$</span>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              className={`${styles.input} ${styles.currencyInput} ${errors.amount ? styles.error : ''}`}
              {...register('amount', { 
                setValueAs: (value) => {
                  if (typeof value === 'string') {
                    return formatAmount(value);
                  }
                  return value;
                }
              })}
              onChange={(e) => {
                const formatted = formatAmount(e.target.value);
                e.target.value = formatted.toFixed(2).replace('.', ',');
              }}
            />
          </div>
          {watchAmount > 0 && (
            <div className={styles.amountPreview}>
              Valor informado: <strong>R$ {watchAmount.toFixed(2)}</strong>
            </div>
          )}
          {errors.amount && (
            <span className={styles.errorMessage}>
              ⚠️ {errors.amount.message}
            </span>
          )}
        </div>

        {/* Categoria */}
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Categoria
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.selectWrapper}>
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
            <span className={styles.selectArrow}>▼</span>
          </div>
          {errors.category && (
            <span className={styles.errorMessage}>
              ⚠️ {errors.category.message}
            </span>
          )}
          
          {/* Preview da categoria selecionada */}
          {watch('category') && (
            <div className={styles.categoryPreview}>
              Categoria selecionada: {
                categories.find(cat => cat.id === watch('category'))?.name
              }
            </div>
          )}
        </div>

        {/* Data */}
        <div className={styles.formGroup}>
          <label htmlFor="date" className={styles.label}>
            Data da Transação
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.dateIcon}>📅</span>
            <input
              id="date"
              type="date"
              className={`${styles.input} ${styles.dateInput} ${errors.date ? styles.error : ''}`}
              {...register('date')}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          {errors.date && (
            <span className={styles.errorMessage}>
              ⚠️ {errors.date.message}
            </span>
          )}
        </div>

        {/* Resumo */}
        {watch('description') && watch('amount') > 0 && watch('category') && (
          <div className={styles.summary}>
            <h4>📋 Resumo da Transação</h4>
            <div className={styles.summaryContent}>
              <div className={styles.summaryRow}>
                <span>Tipo:</span>
                <span className={selectedType === 'income' ? styles.incomeText : styles.expenseText}>
                  {selectedType === 'income' ? '💰 Receita' : '💸 Despesa'}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Descrição:</span>
                <span>{watch('description')}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Valor:</span>
                <span className={selectedType === 'income' ? styles.incomeText : styles.expenseText}>
                  R$ {watch('amount').toFixed(2)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Categoria:</span>
                <span>{categories.find(cat => cat.id === watch('category'))?.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Data:</span>
                <span>{new Date(watch('date')).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        )}

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
            <>
              <span>✅</span>
              Adicionar Transação
            </>
          )}
        </button>

        {/* Mensagens de feedback */}
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className={styles.errorMessageContainer}>
            {errorMessage}
          </div>
        )}
      </form>

      {/* Dicas */}
      <div className={styles.tips}>
        <h4>💡 Dicas para cadastro</h4>
        <ul>
          <li>Use descrições claras e objetivas</li>
          <li>Confira o valor antes de confirmar</li>
          <li>Categorize corretamente para análises precisas</li>
          <li>Registre as transações no dia em que ocorreram</li>
        </ul>
      </div>
    </div>
  );
}