/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setUpdating(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      e.currentTarget.reset();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar senha' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>👤 Meu Perfil</h1>
        <p className={styles.subtitle}>
          Gerencie suas informações e preferências
        </p>
      </header>

      <div className={styles.content}>
        {/* Informações da conta */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>📧 Informações da Conta</h2>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{user?.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Conta criada em:</span>
              <span className={styles.infoValue}>
                {new Date(user?.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Último acesso:</span>
              <span className={styles.infoValue}>
                {new Date(user?.last_sign_in_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Alterar senha */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🔐 Alterar Senha</h2>
          <form onSubmit={handleUpdatePassword} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Nova Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmar Nova Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            {message.text && (
              <div className={`${styles.message} ${styles[message.type]}`}>
                {message.type === 'success' ? '✅' : '❌'} {message.text}
              </div>
            )}

            <button
              type="submit"
              className={styles.button}
              disabled={updating}
            >
              {updating ? (
                <span className={styles.spinner}></span>
              ) : (
                'Atualizar Senha'
              )}
            </button>
          </form>
        </div>

        {/* Preferências */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>⚙️ Preferências</h2>
          <div className={styles.preferences}>
            <div className={styles.preferenceItem}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkbox} />
                <span>Receber notificações por email</span>
              </label>
            </div>
            <div className={styles.preferenceItem}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkbox} />
                <span>Modo escuro (em breve)</span>
              </label>
            </div>
            <div className={styles.preferenceItem}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkbox} />
                <span>Exportar dados automaticamente</span>
              </label>
            </div>
          </div>
          <p className={styles.note}>
            ⚡ Mais preferências em desenvolvimento
          </p>
        </div>

        {/* Estatísticas de uso */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>📊 Estatísticas de Uso</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>0</span>
                <span className={styles.statLabel}>Transações</span>
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statIcon}>🏷️</div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>0</span>
                <span className={styles.statLabel}>Categorias</span>
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>0</span>
                <span className={styles.statLabel}>Dias de uso</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}