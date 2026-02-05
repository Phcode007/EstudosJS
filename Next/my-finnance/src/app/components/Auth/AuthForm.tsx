/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';
import styles from './AuthForm.module.css';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!isLogin && password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        setSuccess('Login realizado com sucesso!');
        router.push('/');
        router.refresh();
      } else {
        // Cadastro
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        setSuccess('Cadastro realizado! Verifique seu email para confirmar.');
        setIsLogin(true);
      }
    } catch (error: any) {
      setError(error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isLogin ? '🔐 Entrar' : '📝 Criar Conta'}
          </h1>
          <p className={styles.subtitle}>
            {isLogin 
              ? 'Entre na sua conta para gerenciar suas finanças'
              : 'Crie uma conta gratuita para começar'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              ❌ {error}
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              ✅ {success}
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner}></span>
            ) : isLogin ? (
              'Entrar'
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className={styles.toggleButton}
            >
              {isLogin ? ' Cadastre-se' : ' Faça login'}
            </button>
          </p>
        </div>

        <div className={styles.features}>
          <h3>✨ Benefícios da conta:</h3>
          <ul>
            <li>📱 Acesso em qualquer dispositivo</li>
            <li>🔒 Dados protegidos e criptografados</li>
            <li>📊 Histórico completo das transações</li>
            <li>☁️ Backup automático na nuvem</li>
          </ul>
        </div>
      </div>
    </div>
  );
}