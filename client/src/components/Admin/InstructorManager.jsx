import { useEffect, useState } from 'react';
import axios from 'axios';

const InstructorManager = () => {
  const [instructors, setInstructors] = useState([]);
  const [newInst, setNewInst] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');

  const fetchInstructors = async () => {
    const res = await axios.get('http://localhost:5000/api/instructors');
    setInstructors(res.data);
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

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
      await axios.post('http://localhost:5000/api/instructors', payload);
      setNewInst({ name: '', username: '', password: '' });
      fetchInstructors();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('שם המשתמש כבר קיים. בחר שם משתמש אחר.');
        return;
      }

      setError('לא הצלחנו ליצור מדריך חדש. בדוק שהשרת רץ ונסה שוב.');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    await axios.patch(`http://localhost:5000/api/instructors/${id}`, { isActive: !currentStatus });
    fetchInstructors();
  };

  const changePassword = async (id) => {
    const newPass = window.prompt('הכנס סיסמה חדשה:');
    const password = String(newPass || '').trim();

    if (!password) {
      return;
    }

    await axios.patch(`http://localhost:5000/api/instructors/${id}`, { password });
    window.alert('הסיסמה שונתה בהצלחה');
    fetchInstructors();
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px' }}>
      <h3>הוספת מדריך חדש</h3>
      <form onSubmit={handleCreate} style={formStyle}>
        <input
          style={inputStyle}
          placeholder="שם מלא"
          value={newInst.name}
          onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
          required
        />
        <input
          style={inputStyle}
          placeholder="שם משתמש"
          value={newInst.username}
          onChange={(e) => setNewInst({ ...newInst, username: e.target.value })}
          required
        />
        <input
          style={inputStyle}
          placeholder="סיסמה"
          type="password"
          value={newInst.password}
          onChange={(e) => setNewInst({ ...newInst, password: e.target.value })}
          required
        />
        <button style={btnStyle}>צור מדריך</button>
      </form>

      {error && <p style={errorStyle}>{error}</p>}

      <h3 style={{ marginTop: '30px' }}>רשימת מדריכים קיימים</h3>
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: '#ecf0f1' }}>
            <th>שם</th>
            <th>שם משתמש</th>
            <th>סטטוס</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {instructors.map((inst) => (
            <tr key={inst.id}>
              <td>{inst.name}</td>
              <td>{inst.username}</td>
              <td style={{ color: inst.isActive ? 'green' : 'red' }}>
                {inst.isActive ? 'פעיל' : 'מוקפא'}
              </td>
              <td>
                <button onClick={() => toggleStatus(inst.id, inst.isActive)} style={actionBtn}>
                  {inst.isActive ? 'הקפא' : 'הפעל'}
                </button>
                <button onClick={() => changePassword(inst.id)} style={actionBtn}>
                  שנה סיסמה
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const formStyle = { display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' };
const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
const btnStyle = { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' };
const errorStyle = { color: '#c0392b', fontWeight: 'bold', marginTop: 0 };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const actionBtn = { marginLeft: '5px', cursor: 'pointer', padding: '3px 8px' };

export default InstructorManager;
