import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const InstructorManager = ({ onInstructorsUpdated }) => {
  const [instructors, setInstructors] = useState([]);
  const [newInst, setNewInst] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');

  const refreshInstructors = useCallback(async () => {
    const res = await axios.get('/api/instructors');
    setInstructors(res.data);

    if (onInstructorsUpdated) {
      onInstructorsUpdated();
    }
  }, [onInstructorsUpdated]);

  useEffect(() => {
    refreshInstructors();
  }, [refreshInstructors]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: newInst.name.trim(),
      username: newInst.username.trim(),
      password: newInst.password.trim()
    };

    if (!payload.name || !payload.username || !payload.password) {
      setError('חובה למלא שם, שם משתמש וסיסמה.');
      return;
    }

    try {
      await axios.post('/api/instructors', payload);
      setNewInst({ name: '', username: '', password: '' });
      refreshInstructors();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('שם המשתמש כבר קיים. בחר שם משתמש אחר.');
        return;
      }

      setError('לא הצלחנו ליצור מדריך חדש. בדוק שהשרת רץ ונסה שוב.');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    await axios.patch(`/api/instructors/${id}`, {
      isActive: currentStatus === false
    });
    refreshInstructors();
  };

  const changePassword = async (id) => {
    const newPass = window.prompt('הכנס סיסמה חדשה:');
    const password = String(newPass || '').trim();

    if (!password) {
      return;
    }

    await axios.patch(`/api/instructors/${id}`, { password });
    window.alert('הסיסמה שונתה בהצלחה');
    refreshInstructors();
  };

  return (
    <section style={styles.wrapper}>
      <form onSubmit={handleCreate} style={styles.formCard}>
        <h4 style={styles.formTitle}>הוספת מדריך חדש</h4>
        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="שם מלא"
            value={newInst.name}
            onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="שם משתמש"
            value={newInst.username}
            onChange={(e) => setNewInst({ ...newInst, username: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="סיסמה"
            type="password"
            value={newInst.password}
            onChange={(e) => setNewInst({ ...newInst, password: e.target.value })}
            required
          />
          <button style={styles.primaryBtn}>צור מדריך</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
      </form>

      <div style={styles.instructorGrid}>
        {instructors.map((inst) => {
          const isActive = inst.isActive !== false;

          return (
            <article key={inst.id} style={styles.instructorCard}>
              <div style={styles.cardHeader}>
                <div>
                  <strong style={styles.name}>{inst.name}</strong>
                  <span style={styles.username}>{inst.username}</span>
                </div>
                <span style={isActive ? styles.activeBadge : styles.frozenBadge}>
                  {isActive ? 'פעיל' : 'מוקפא'}
                </span>
              </div>

              <div style={styles.actions}>
                <button onClick={() => toggleStatus(inst.id, isActive)} style={styles.secondaryBtn}>
                  {isActive ? 'הקפא מדריך' : 'הפעל מדריך'}
                </button>
                <button onClick={() => changePassword(inst.id)} style={styles.secondaryBtn}>
                  שנה סיסמה
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

const styles = {
  wrapper: { display: 'grid', gap: '18px', direction: 'rtl' },
  formCard: {
    display: 'grid',
    gap: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px'
  },
  formTitle: { margin: 0, color: '#1e293b', fontSize: '16px' },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '10px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    minWidth: 0
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700'
  },
  error: { color: '#c0392b', fontWeight: '700', margin: 0 },
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
    display: 'grid',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'flex-start'
  },
  name: { display: 'block', color: '#1e293b', fontSize: '16px' },
  username: { display: 'block', color: '#64748b', fontSize: '13px', marginTop: '3px' },
  activeBadge: {
    color: '#166534',
    backgroundColor: '#dcfce7',
    padding: '5px 9px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700'
  },
  frozenBadge: {
    color: '#475569',
    backgroundColor: '#e2e8f0',
    padding: '5px 9px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700'
  },
  actions: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' },
  secondaryBtn: {
    backgroundColor: '#fff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700'
  }
};

export default InstructorManager;
