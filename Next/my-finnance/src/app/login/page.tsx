import AuthForm from '@/app/components/Auth/AuthForm';
import Link from 'next/link';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <AuthForm />
      <div className={styles.info}>
        <h2>💰 Comece a controlar suas finanças hoje!</h2>
        <p>
          Com o My Finnance você pode:
        </p>
        <ul>
          <li>📝 Registrar todas as suas transações</li>
          <li>📊 Ver gráficos e estatísticas detalhadas</li>
          <li>🎯 Definir e acompanhar metas financeiras</li>
          <li>☁️ Ter backup automático dos seus dados</li>
        </ul>
        <div className={styles.cta}>
          <p>É totalmente gratuito!</p>
          <Link href="/" className={styles.homeLink}>
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}