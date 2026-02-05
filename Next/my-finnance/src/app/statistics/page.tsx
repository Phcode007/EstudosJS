import Charts from '@/app/components/Charts/Charts';
import AdvancedCharts from '@/app/components/AdvancedCharts/AdvancedCharts';
import styles from './page.module.css';

export default function StatisticsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>📈 Estatísticas Detalhadas</h1>
        <p className={styles.subtitle}>
          Análises gráficas e insights sobre suas finanças
        </p>
      </header>

      <div className={styles.content}>
        {/* Gráficos principais */}
        <div className={styles.mainCharts}>
          <Charts />
        </div>

        {/* Gráficos avançados */}
        <div className={styles.advancedSection}>
          <AdvancedCharts />
        </div>

        {/* Insights */}
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>📊</div>
            <div className={styles.insightContent}>
              <h3>Como usar as estatísticas</h3>
              <p>Use os gráficos para identificar padrões nos seus gastos e receitas.</p>
            </div>
          </div>
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>🎯</div>
            <div className={styles.insightContent}>
              <h3>Defina metas</h3>
              <p>Com base nas suas estatísticas, estabeleça metas realistas de economia.</p>
            </div>
          </div>
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>📅</div>
            <div className={styles.insightContent}>
              <h3>Monitoramento contínuo</h3>
              <p>Revise suas estatísticas regularmente para acompanhar seu progresso.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}