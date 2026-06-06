import { useState } from 'react';
import axios from 'axios';

const ScheduleLesson = ({ clients, onScheduled }) => {
  const [selectedId, setSelectedId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  // סינון דיירים שעדיין לא תואמו או שצריכים הדרכה
  const availableClients = clients.filter(c => !c.isTrained);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  // שליפת המשתמש המחובר מה-localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const instructorId = user?.id || "unknown";

  try {
    await axios.patch(`/api/clients/${selectedId}/schedule`, { 
      date, 
      time, 
      instructorId // שליחת ה-ID לשיוך
    });
    alert('ההדרכה תואמה והדייר שויך אליך!');
    if (onScheduled) onScheduled();
  } catch {
    alert('שגיאה בתיאום');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={containerStyle}>
      <h3 style={{ marginTop: 0 }}>תיאום הדרכה חדשה</h3>
      <form onSubmit={handleSubmit} style={formStyle}>
        <select 
          style={inputStyle} 
          value={selectedId} 
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">בחר דייר מהרשימה...</option>
          {availableClients.map(c => (
            <option key={c.id} value={c.id}>
              {c.firstName ? `${c.firstName} ${c.lastName}` : c.phone} - {c.address}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="date" 
            style={inputStyle} 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
          <input 
            type="time" 
            style={inputStyle} 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
          />
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'מעדכן...' : 'קבע הדרכה ביומן'}
        </button>
      </form>
    </div>
  );
};

const containerStyle = { padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', direction: 'rtl' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px', backgroundColor: '#f9f9f9' };
const buttonStyle = { padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#8e44ad', color: '#fff', fontWeight: 'bold', cursor: 'pointer' };

export default ScheduleLesson;

