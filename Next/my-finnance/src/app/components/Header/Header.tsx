import styles from './Header.module.css'
import {format} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Header() {
  const currentDate = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <h1 className={styles.title}>💰 My Finnance</h1>
        <p className={styles.subtitle}>Controle suas finanças de forma simples</p>
      </div>
      
      <div className={styles.rightSection}>
        <div className={styles.dateDisplay}>
          <span className={styles.dateLabel}>Hoje é:</span>
          <span className={styles.dateValue}>{currentDate}</span>
        </div>
        
        <button className={styles.themeButton} aria-label="Alternar tema">
          <span>🌙</span>
        </button>
      </div>
    </header>
  );
}