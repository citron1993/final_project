import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManualRegistration = ({ onClientAdded }) => {
  const [fields, setFields] = useState([]); // שדות דינמיים מהשרת
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings/fields');
        setFields(res.data);
        // אתחול הסטייט של הטופס עם שדות ריקים
        const initialData = {};
        res.data.forEach(f => initialData[f.id] = '');
        setFormData(initialData);
      } catch (err) {
        console.error("Error loading fields");
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/clients', formData);
      alert('דייר נרשם בהצלחה!');
      onClientAdded(); // רענון הרשימה בדאשבורד
    } catch (err) {
      alert('שגיאה ברישום');
    }
  };

  if (loading) return <div>טוען טופס...</div>;

  return (
    <div style={containerStyle}>
      <h3>רישום דייר חדש</h3>
      <form onSubmit={handleSubmit} style={formStyle}>
        {fields.map(field => (
          <div key={field.id} style={inputGroup}>
            <label style={labelStyle}>{field.label}</label>
            <input
              type={field.type}
              required={field.required}
              style={inputStyle}
              value={formData[field.id] || ''}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            />
          </div>
        ))}
        <button type="submit" style={btnStyle}>שלח רישום</button>
      </form>
    </div>
  );
};

// Styles
const containerStyle = { padding: '20px', backgroundColor: '#fff', borderRadius: '12px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontWeight: 'bold', fontSize: '14px', color: '#34495e' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd' };
const btnStyle = { padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };

export default ManualRegistration;