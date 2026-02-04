'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./Navigation.module.css"

const menuItems =[
    {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: '📊',
    description: 'Visão geral das finanças'
  },
  {
    id: 'transactions',
    label: 'Transações',
    path: '/transactions',
    icon: '💰',
    description: 'Lista de receitas e despesas'
  },
  {
    id: 'statistics',
    label: 'Estatísticas',
    path: '/statistics',
    icon: '📈',
    description: 'Gráficos e análises'
  },
  {
    id: 'categories',
    label: 'Categorias',
    path: '/categories',
    icon: '🏷️',
    description: 'Gerencie categorias'
  },
  {
    id: 'reports',
    label: 'Relatórios',
    path: '/reports',
    icon: '📋',
    description: 'Relatórios detalhados'
  }
]

export default function Navigation(){
    const pathname = usePathname()
    const [isExpanded, setIsExpanded] = useState(true)

    const toggleExpand = () =>{
        setIsExpanded(!isExpanded)
    }

    return(<nav className={`${styles.navigation} ${isExpanded ? styles.expanded : styles.collapsed}`}>
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
          )
        })}
      </ul>

      <div className={styles.navFooter}>
        {isExpanded && (
          <div className={styles.userSection}>
            <div className={styles.userAvatar}>👤</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Usuário</span>
              <span className={styles.userEmail}>usuario@email.com</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}