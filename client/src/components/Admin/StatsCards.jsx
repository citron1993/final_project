import React from 'react';

const StatsCards = ({ stats }) => {
  const cardData = [
    { title: 'סה"כ דיירים', value: stats.total, color: '#3498db', icon: '👥' },
    { title: 'הדרכות שבוצעו', value: stats.completed, color: '#27ae60', icon: '✅' },
    { title: 'ממתינים לביצוע', value: stats.pending, color: '#f1c40f', icon: '⏳' },
    { title: 'טרם שובצו', value: stats.waiting, color: '#e74c3c', icon: '📅' },
  ];

  return (
    <div style={styles.grid}>
      {cardData.map((card, index) => (
        <div key={index} style={{ ...styles.card, borderRight: `5px solid ${card.color}` }}>
          <div style={styles.icon}>{card.icon}</div>
          <div>
            <div style={styles.title}>{card.title}</div>
            <div style={styles.value}>{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' },
  icon: { fontSize: '30px' },
  title: { fontSize: '14px', color: '#7f8c8d', fontWeight: 'bold' },
  value: { fontSize: '24px', color: '#2c3e50', fontWeight: 'bold' }
};

export default StatsCards;