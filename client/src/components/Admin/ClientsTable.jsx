const ClientsTable = ({ clients, fields = [] }) => {
  return (
    <div style={styles.grid}>
      {clients.length > 0 ? (
        clients.map((client) => (
          <article key={client.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={getStatusStyle(client)}>{getStatusLabel(client)}</span>
              <span style={styles.date}>{client.createdAt || 'ללא תאריך'}</span>
            </div>

            <h3 style={styles.clientName}>
              {client.firstName || 'דייר'} {client.lastName || ''}
            </h3>

            <div style={styles.detailsGrid}>
              {fields.map((field) => (
                <div key={field.id} style={styles.detail}>
                  <span style={styles.detailLabel}>{field.label}</span>
                  <span style={styles.detailValue}>{client[field.id] || '---'}</span>
                </div>
              ))}
            </div>
          </article>
        ))
      ) : (
        <div style={styles.emptyState}>אין דיירים להצגה</div>
      )}
    </div>
  );
};

const getStatusLabel = (client) => {
  if (client.isTrained) {
    return 'הדרכה בוצעה';
  }

  if (client.scheduledDate) {
    return 'ממתין להדרכה';
  }

  if (!client.isRegistered) {
    return 'ממתין להשלמת פרטים';
  }

  return 'טרם שובץ';
};

const getStatusStyle = (client) => {
  const base = {
    padding: '5px 9px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    width: 'fit-content'
  };

  if (client.isTrained) {
    return { ...base, backgroundColor: '#dcfce7', color: '#166534' };
  }

  if (client.scheduledDate) {
    return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
  }

  if (!client.isRegistered) {
    return { ...base, backgroundColor: '#dbeafe', color: '#1d4ed8' };
  }

  return { ...base, backgroundColor: '#e2e8f0', color: '#334155' };
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '14px'
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
    display: 'grid',
    gap: '14px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  date: { color: '#64748b', fontSize: '12px' },
  clientName: {
    margin: 0,
    color: '#1e293b',
    fontSize: '18px',
    lineHeight: 1.25
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px'
  },
  detail: {
    display: 'grid',
    gap: '3px',
    minWidth: 0
  },
  detailLabel: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '700'
  },
  detailValue: {
    color: '#334155',
    fontSize: '14px',
    overflowWrap: 'anywhere'
  },
  emptyState: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '22px',
    textAlign: 'center',
    color: '#64748b'
  }
};

export default ClientsTable;
