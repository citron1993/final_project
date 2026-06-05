import { useMemo, useState } from 'react';

const StatsCards = ({ stats, clients = [], instructors = [] }) => {
  const [filters, setFilters] = useState({
    instructorId: 'all',
    status: 'all',
    fromDate: '',
    toDate: ''
  });

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const instructorId = client.instructorId ? String(client.instructorId) : '';
      const status = getClientStatus(client);
      const date = client.scheduledDate || '';

      const matchesInstructor = filters.instructorId === 'all' || instructorId === filters.instructorId;
      const matchesStatus = filters.status === 'all' || status === filters.status;
      const matchesFromDate = !filters.fromDate || (date && date >= filters.fromDate);
      const matchesToDate = !filters.toDate || (date && date <= filters.toDate);

      return matchesInstructor && matchesStatus && matchesFromDate && matchesToDate;
    });
  }, [clients, filters]);

  const instructorStats = useMemo(() => {
    const visibleInstructors = filters.instructorId === 'all'
      ? instructors
      : instructors.filter((instructor) => String(instructor.id) === filters.instructorId);

    return visibleInstructors.map((instructor) => {
      const instructorClients = filteredClients.filter(
        (client) => String(client.instructorId) === String(instructor.id)
      );

      return {
        id: instructor.id,
        name: instructor.name,
        username: instructor.username,
        isActive: instructor.isActive !== false,
        assigned: instructorClients.length,
        completed: instructorClients.filter((client) => client.isTrained).length,
        pending: instructorClients.filter((client) => client.scheduledDate && !client.isTrained).length,
        unscheduled: instructorClients.filter((client) => !client.scheduledDate && !client.isTrained).length
      };
    });
  }, [filteredClients, filters.instructorId, instructors]);

  const filteredSummary = useMemo(() => ({
    total: filteredClients.length,
    completed: filteredClients.filter((client) => client.isTrained).length,
    pending: filteredClients.filter((client) => client.scheduledDate && !client.isTrained).length,
    waiting: filteredClients.filter((client) => !client.scheduledDate).length
  }), [filteredClients]);

  const cardData = [
    { title: 'סה"כ דיירים', value: stats.total, filteredValue: filteredSummary.total, color: '#2563eb' },
    { title: 'הדרכות שבוצעו', value: stats.completed, filteredValue: filteredSummary.completed, color: '#16a34a' },
    { title: 'הדרכות ממתינות', value: stats.pending, filteredValue: filteredSummary.pending, color: '#ca8a04' },
    { title: 'טרם שובצו', value: stats.waiting, filteredValue: filteredSummary.waiting, color: '#dc2626' },
    { title: 'מדריכים פעילים', value: stats.activeInstructors, filteredValue: null, color: '#0f766e' }
  ];

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ instructorId: 'all', status: 'all', fromDate: '', toDate: '' });
  };

  const exportCsv = () => {
    const rows = [
      ['מדריך', 'שם משתמש', 'סטטוס מדריך', 'משויכים', 'בוצעו', 'ממתינות', 'משויך ללא תאריך'],
      ...instructorStats.map((instructor) => [
        instructor.name,
        instructor.username,
        instructor.isActive ? 'פעיל' : 'מוקפא',
        instructor.assigned,
        instructor.completed,
        instructor.pending,
        instructor.unscheduled
      ])
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'instructor-statistics.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section style={styles.wrapper}>
      <div style={styles.grid}>
        {cardData.map((card) => (
          <article key={card.title} style={styles.summaryCard}>
            <span style={{ ...styles.cardAccent, backgroundColor: card.color }} />
            <span style={styles.cardTitle}>{card.title}</span>
            <strong style={styles.cardValue}>{card.value || 0}</strong>
            {card.filteredValue !== null && (
              <span style={styles.filteredValue}>בסינון: {card.filteredValue || 0}</span>
            )}
          </article>
        ))}
      </div>

      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>ביצועי מדריכים</h3>
        <span style={styles.sectionHint}>
          "משויך ללא תאריך" הוא דייר שכבר שויך למדריך, אבל עדיין לא נקבעה לו הדרכה ביומן.
        </span>
      </div>

      <div style={styles.filters}>
        <select
          value={filters.instructorId}
          onChange={(e) => updateFilter('instructorId', e.target.value)}
          style={styles.select}
        >
          <option value="all">כל המדריכים</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={String(instructor.id)}>
              {instructor.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          style={styles.select}
        >
          <option value="all">כל הסטטוסים</option>
          <option value="completed">בוצעו</option>
          <option value="pending">ממתינות</option>
          <option value="unscheduled">משויך ללא תאריך</option>
          <option value="unassigned">טרם שובצו</option>
        </select>

        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => updateFilter('fromDate', e.target.value)}
          style={styles.select}
          aria-label="מתאריך"
        />

        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => updateFilter('toDate', e.target.value)}
          style={styles.select}
          aria-label="עד תאריך"
        />

        <button type="button" onClick={resetFilters} style={styles.secondaryBtn}>נקה סינון</button>
        <button type="button" onClick={exportCsv} style={styles.primaryBtn}>ייצוא CSV</button>
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
              <Metric label="משויך ללא תאריך" value={instructor.unscheduled} accent="#64748b" />
            </div>
          </article>
        ))}

        {instructorStats.length === 0 && (
          <p style={styles.emptyState}>אין מדריכים להצגה לפי הסינון הנוכחי.</p>
        )}
      </div>
    </section>
  );
};

const getClientStatus = (client) => {
  if (client.isTrained) {
    return 'completed';
  }

  if (client.instructorId && client.scheduledDate) {
    return 'pending';
  }

  if (client.instructorId && !client.scheduledDate) {
    return 'unscheduled';
  }

  return 'unassigned';
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
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: '18px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
    display: 'grid',
    gap: '8px',
    minHeight: '118px'
  },
  cardAccent: {
    position: 'absolute',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    width: '4px'
  },
  cardTitle: { fontSize: '14px', color: '#64748b', fontWeight: '700' },
  cardValue: { fontSize: '30px', lineHeight: 1, color: '#1e293b' },
  filteredValue: { color: '#64748b', fontSize: '12px', fontWeight: '700' },
  sectionHeader: { display: 'grid', gap: '4px' },
  sectionTitle: { margin: 0, color: '#1e293b', fontSize: '20px' },
  sectionHint: { color: '#64748b', fontSize: '14px' },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px'
  },
  select: {
    padding: '11px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    backgroundColor: '#fff',
    minWidth: 0,
    fontSize: '14px'
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
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
