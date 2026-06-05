import { useMemo, useState } from 'react';

const ClientsTable = ({ clients, fields = [], instructors = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [instructorFilter, setInstructorFilter] = useState('all');

  const instructorById = useMemo(() => {
    return instructors.reduce((acc, instructor) => {
      acc[String(instructor.id)] = instructor;
      return acc;
    }, {});
  }, [instructors]);

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      const status = getStatusKey(client);
      const instructorId = client.instructorId ? String(client.instructorId) : '';
      const searchableText = [
        client.firstName,
        client.lastName,
        client.phone,
        client.email,
        client.address,
        client.status,
        instructorById[instructorId]?.name,
        ...fields.map((field) => client[field.id])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesInstructor = instructorFilter === 'all' || instructorId === instructorFilter;

      return matchesSearch && matchesStatus && matchesInstructor;
    });
  }, [clients, fields, instructorById, instructorFilter, searchTerm, statusFilter]);

  return (
    <section style={styles.wrapper}>
      <div style={styles.filters}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="חיפוש לפי שם, טלפון, כתובת או מדריך"
          style={styles.searchInput}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">כל הסטטוסים</option>
          <option value="completed">בוצעו</option>
          <option value="scheduled">ממתינים להדרכה</option>
          <option value="details">ממתינים לפרטים</option>
          <option value="unassigned">טרם שובצו</option>
        </select>

        <select
          value={instructorFilter}
          onChange={(e) => setInstructorFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">כל המדריכים</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={String(instructor.id)}>
              {instructor.name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.resultLine}>
        מוצגים {filteredClients.length} מתוך {clients.length} דיירים
      </div>

      <div style={styles.grid}>
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => {
            const instructor = client.instructorId
              ? instructorById[String(client.instructorId)]
              : null;

            return (
              <article key={client.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={getStatusStyle(client)}>{getStatusLabel(client)}</span>
                  <span style={styles.date}>{client.createdAt || 'ללא תאריך'}</span>
                </div>

                <h3 style={styles.clientName}>
                  {client.firstName || 'דייר'} {client.lastName || ''}
                </h3>

                <div style={styles.assignmentBox}>
                  <div style={styles.assignmentItem}>
                    <span style={styles.detailLabel}>מדריך משויך</span>
                    <strong style={styles.assignmentValue}>{instructor?.name || 'טרם שובץ'}</strong>
                  </div>
                  <div style={styles.assignmentItem}>
                    <span style={styles.detailLabel}>ביצוע הדרכה</span>
                    <strong style={client.isTrained ? styles.doneText : styles.pendingText}>
                      {client.isTrained ? instructor?.name || 'בוצע' : 'עדיין לא בוצע'}
                    </strong>
                  </div>
                </div>

                <div style={styles.detailsGrid}>
                  {fields.map((field) => (
                    <div key={field.id} style={styles.detail}>
                      <span style={styles.detailLabel}>{field.label}</span>
                      <span style={styles.detailValue}>{client[field.id] || '---'}</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })
        ) : (
          <div style={styles.emptyState}>לא נמצאו דיירים לפי הסינון הנוכחי</div>
        )}
      </div>
    </section>
  );
};

const getStatusKey = (client) => {
  if (client.isTrained) {
    return 'completed';
  }

  if (client.scheduledDate) {
    return 'scheduled';
  }

  if (!client.isRegistered) {
    return 'details';
  }

  return 'unassigned';
};

const getStatusLabel = (client) => {
  const statusKey = getStatusKey(client);

  if (statusKey === 'completed') {
    return 'הדרכה בוצעה';
  }

  if (statusKey === 'scheduled') {
    return 'ממתין להדרכה';
  }

  if (statusKey === 'details') {
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

  const statusKey = getStatusKey(client);

  if (statusKey === 'completed') {
    return { ...base, backgroundColor: '#dcfce7', color: '#166534' };
  }

  if (statusKey === 'scheduled') {
    return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
  }

  if (statusKey === 'details') {
    return { ...base, backgroundColor: '#dbeafe', color: '#1d4ed8' };
  }

  return { ...base, backgroundColor: '#e2e8f0', color: '#334155' };
};

const styles = {
  wrapper: { display: 'grid', gap: '14px' },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px',
    alignItems: 'center'
  },
  searchInput: {
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
    minWidth: 0
  },
  select: {
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    minWidth: 0
  },
  resultLine: {
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '700'
  },
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
  assignmentBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  assignmentItem: { display: 'grid', gap: '4px' },
  assignmentValue: { color: '#1e293b', fontSize: '14px' },
  doneText: { color: '#166534', fontSize: '14px' },
  pendingText: { color: '#92400e', fontSize: '14px' },
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
