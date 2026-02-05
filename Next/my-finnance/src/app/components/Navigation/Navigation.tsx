/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/components/Navigation/Navigation.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import styles from './Navigation.module.css';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: '📊', description: 'Visão geral' },
  { id: 'transactions', label: 'Transações', path: '/transactions', icon: '💰', description: 'Receitas e despesas' },
  { id: 'categories', label: 'Categorias', path: '/categories', icon: '🏷️', description: 'Gerenciar categorias' },
  { id: 'statistics', label: 'Estatísticas', path: '/statistics', icon: '📈', description: 'Gráficos e análises' },
  { id: 'reports', label: 'Relatórios', path: '/reports', icon: '📋', description: 'Relatórios detalhados' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <nav className={`${styles.navigation} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      {/* Cabeçalho do menu */}
      <div className={styles.navHeader}>
        <button 
          onClick={toggleExpand}
          className={styles.toggleButton}
          aria-label={isExpanded ? "Recolher menu" : "Expandir menu"}
        >
          {isExpanded ? '◀️' : '▶️'}
        </button>
        {isExpanded && <h2 className={styles.navTitle}>Menu</h2>}
      </div>

      {/* Lista de itens do menu */}
      <ul className={styles.menuList}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <li key={item.id} className={styles.menuItem}>
              <Link 
                href={item.path} 
                className={`${styles.menuLink} ${isActive ? styles.active : ''}`}
                title={item.description}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {isExpanded && (
                  <div className={styles.menuContent}>
                    <span className={styles.menuLabel}>{item.label}</span>
                    {isExpanded && (
                      <span className={styles.menuDescription}>{item.description}</span>
                    )}
                  </div>
                )}
                {isActive && <div className={styles.activeIndicator}></div>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Rodapé do menu */}
      <div className={styles.navFooter}>
        {isExpanded && (
          <div className={styles.userSection}>
            {loading ? (
              <div className={styles.loading}>Carregando...</div>
            ) : user ? (
              <>
                <div className={styles.userAvatar}>
                  {user.email?.charAt(0).toUpperCase() || '👤'}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {user.email?.split('@')[0] || 'Usuário'}
                  </span>
                  <span className={styles.userEmail}>{user.email}</span>
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.userAvatar}>👤</div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>Visitante</span>
                  <span className={styles.userEmail}>Faça login para salvar</span>
                  <Link href="/login" className={styles.loginButton}>
                    Entrar
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}