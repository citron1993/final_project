import React from 'react';

const ClientsTable = ({ clients, fields = [], onDelete }) => {
  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>סטטוס</th>
            {/* עמודות דינמיות לפי מה שהמנהל הגדיר */}
            {fields.map(field => (
              <th key={field.id} style={styles.th}>{field.label}</th>
            ))}
            <th style={styles.th}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <tr key={client.id} style={styles.tr}>
                <td style={styles.td}>
                  <span style={getStatusStyle(client.status)}>{client.status}</span>
                </td>
                
                {/* הצגת המידע לפי השדות הדינמיים */}
                {fields.map(field => (
                  <td key={field.id} style={styles.td}>
                    {client[field.id] || '---'}
                  </td>
                ))}

                <td style={styles.td}>
                  <button 
                    onClick={() => onDelete(client.id)} 
                    style={styles.deleteBtn}
                  >
                    🗑️ מחק
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={fields.length + 2} style={{ padding: '20px', textAlign: 'center', color: '#95a5a6' }}>
                אין דיירים להצגה
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// פונקציה לעיצוב הסטטוס
const getStatusStyle = (status) => {
  const base = { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' };
  if (status?.includes('בוצע')) return { ...base, backgroundColor: '#d4edda', color: '#155724' };
  if (status?.includes('תואם')) return { ...base, backgroundColor: '#fff3cd', color: '#856404' };
  return { ...base, backgroundColor: '#e2e3e5', color: '#383d41' };
};

const styles = {
  tableWrapper: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'right',
    direction: 'rtl',
  },
  headerRow: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
  },
  th: {
    padding: '12px 15px',
    color: '#495057',
    fontSize: '14px',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '12px 15px',
    fontSize: '14px',
    color: '#2c3e50',
  },
  deleteBtn: {
    backgroundColor: '#ff4d4d',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  }
};

export default ClientsTable;