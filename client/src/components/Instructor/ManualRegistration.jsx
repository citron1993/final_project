import { useState, useEffect } from 'react';
import axios from 'axios';

const ManualRegistration = ({ onClientAdded }) => {
  const [fields, setFields] = useState([]); // ×©×“×•×ª ×“×™× ×ž×™×™× ×ž×”×©×¨×ª
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get('/api/settings/fields');
        setFields(res.data);
        // ××ª×—×•×œ ×”×¡×˜×™×™×˜ ×©×œ ×”×˜×•×¤×¡ ×¢× ×©×“×•×ª ×¨×™×§×™×
        const initialData = {};
        res.data.forEach(f => initialData[f.id] = '');
        setFormData(initialData);
      } catch {
        console.error("Error loading fields");
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emptyRequiredFields = fields.filter(field => (
      field.required && !String(formData[field.id] || '').trim()
    ));

    if (emptyRequiredFields.length > 0) {
      const fieldNames = emptyRequiredFields.map(field => field.label).join(', ');
      const approved = window.confirm(
        `×”×©×“×•×ª ×”×‘××™× ×¨×™×§×™×: ${fieldNames}. ×”×× ×œ×”×ž×©×™×š ×‘×›×œ ×–××ª?`
      );

      if (!approved) {
        return;
      }
    }

    try {
      await axios.post('/api/clients', formData);
      alert('×“×™×™×¨ × ×¨×©× ×‘×”×¦×œ×—×”!');
      onClientAdded(); // ×¨×¢× ×•×Ÿ ×”×¨×©×™×ž×” ×‘×“××©×‘×•×¨×“
    } catch {
      alert('×©×’×™××” ×‘×¨×™×©×•×');
    }
  };

  if (loading) return <div>×˜×•×¢×Ÿ ×˜×•×¤×¡...</div>;

  return (
    <div style={containerStyle}>
      <h3>×¨×™×©×•× ×“×™×™×¨ ×—×“×©</h3>
      <form onSubmit={handleSubmit} style={formStyle}>
        {fields.map(field => (
          <div key={field.id} style={inputGroup}>
            <label style={labelStyle}>{field.label}</label>
            <input
              type={field.type}
              aria-required={field.required}
              style={inputStyle}
              value={formData[field.id] || ''}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            />
          </div>
        ))}
        <button type="submit" style={btnStyle}>×©×œ×— ×¨×™×©×•×</button>
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

