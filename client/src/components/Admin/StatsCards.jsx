const StatsCards = ({ stats }) => {
  const cardData = [
    { title: 'סה"כ דיירים', value: stats.total, color: '#2563eb' },
    { title: 'הדרכות שבוצעו', value: stats.completed, color: '#16a34a' },
    { title: 'הדרכות ממתינות', value: stats.pending, color: '#ca8a04' },
    { title: 'טרם שובצו', value: stats.waiting, color: '#dc2626' },
    { title: 'מדריכים פעילים', value: stats.activeInstructors, color: '#0f766e' }
  ];

  const instructorStats = stats.instructorStats || [];

  return (
    <section style={styles.wrapper}>
      <div style={styles.grid}>
        {cardData.map((card) => (
          <article key={card.title} style={{ ...styles.summaryCard, borderColor: card.color }}>
            <span style={styles.cardTitle}>{card.title}</span>
            <strong style={{ ...styles.cardValue, color: card.color }}>{card.value || 0}</strong>
          </article>
        ))}
      </div>

      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>ביצועי מדריכים</h3>
        <span style={styles.sectionHint}>כמה הדרכות כל מדריך ביצע ומה עדיין פתוח</span>
      </div>

      <div style={styles.instructorGrid}>
        {instructorStats.map((instructor) => (
          <article key={instructor.id || instructor.username} style={styles.instructorCard}>
            <div style={styles.instructorHeader}>
              <div>
                <strong style={styles.instructorName}>{instructor.name}</strong>
                <span style={styles.username}>{instructor.username}</span>
              </div>
              <span style={instructor.isActive ? styles.activeBadge : styles.frozenBadge}>
                {instructor.isActive ? 'פעיל' : 'מוקפא'}
              </span>
            </div>

            <div style={styles.metricGrid}>
              <Metric label="משויכים" value={instructor.assigned} />
              <Metric label="בוצעו" value={instructor.completed} accent="#16a34a" />
              <Metric label="ממתינות" value={instructor.pending} accent="#ca8a04" />
              <Metric label="ללא תאריך" value={instructor.unscheduled} accent="#64748b" />
            </div>
          </article>
        ))}

        {instructorStats.length === 0 && (
          <p style={styles.emptyState}>עדיין אין מדריכים להצגה.</p>
        )}
      </div>
    </section>
  );
};

const Metric = ({ label, value, accent = '#1e293b' }) => (
  <div style={styles.metric}>
    <span style={styles.metricLabel}>{label}</span>
    <strong style={{ ...styles.metricValue, color: accent }}>{value || 0}</strong>
  </div>
);

const styles = {
  wrapper: { display: 'grid', gap: '24px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
    display: 'grid',
    gap: '8px',
    minHeight: '108px'
  },
  cardTitle: { fontSize: '14px', color: '#64748b', fontWeight: '700' },
  cardValue: { fontSize: '30px', lineHeight: 1 },
  sectionHeader: { display: 'grid', gap: '4px' },
  sectionTitle: { margin: 0, color: '#1e293b', fontSize: '20px' },
  sectionHint: { color: '#64748b', fontSize: '14px' },
  instructorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px'
  },
  instructorCard: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
    display: 'grid',
    gap: '16px'
  },
  instructorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'flex-start'
  },
  instructorName: { display: 'block', color: '#1e293b', fontSize: '16px' },
  username: { display: 'block', color: '#64748b', fontSize: '13px', marginTop: '3px' },
  activeBadge: {
    color: '#166534',
    backgroundColor: '#dcfce7',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700'
  },
  frozenBadge: {
    color: '#475569',
    backgroundColor: '#e2e8f0',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700'
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px'
  },
  metric: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '10px',
    display: 'grid',
    gap: '4px'
  },
  metricLabel: { color: '#64748b', fontSize: '12px', fontWeight: '700' },
  metricValue: { fontSize: '22px', lineHeight: 1 },
  emptyState: {
    margin: 0,
    color: '#64748b',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '18px',
    textAlign: 'center'
  }
};

export default StatsCards;
