import React from 'react';

const AdminStats = ({ stats }) => {
  const cardStyle = {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    flex: 1,
    textAlign: 'center',
    minWidth: '150px'
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
      <div style={cardStyle}>
        <h3 style={{ color: '#555', margin: '0' }}>סה"כ דיירים</h3>
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{stats.total || 0}</p>
      </div>
      <div style={cardStyle}>
        <h3 style={{ color: '#555', margin: '0' }}>בוצעו</h3>
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0', color: '#2ecc71' }}>{stats.completed || 0}</p>
      </div>
      <div style={cardStyle}>
        <h3 style={{ color: '#555', margin: '0' }}>ממתינים</h3>
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0', color: '#e67e22' }}>{stats.pending || 0}</p>
      </div>
    </div>
  );
};

export default AdminStats;