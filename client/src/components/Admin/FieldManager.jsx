import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FieldManager = ({ onFieldsUpdated }) => {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ label: '', type: 'text', required: true });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/settings/fields');
      setFields(res.data || []);
    } catch (err) {
      console.error("Error fetching fields:", err);
    }
  };

  const addField = async () => {
    if (!newField.label) return alert("חובה להזין שם לשדה");
    
    // יצירת מזהה ייחודי לשדה (ללא רווחים)
    const id = 'field_' + Date.now();
    const updatedFields = [...fields, { ...newField, id }];
    
    await saveFields(updatedFields);
    setNewField({ label: '', type: 'text', required: true });
  };

  const removeField = async (id, label) => {
    const confirmDelete = window.confirm(`⚠️ זהירות: האם להסיר את השדה "${label}"? נתונים שנשמרו בשדה זה אצל דיירים קיימים לא יוצגו יותר.`);
    if (confirmDelete) {
      const updatedFields = fields.filter(f => f.id !== id);
      await saveFields(updatedFields);
    }
  };

  const saveFields = async (updatedFields) => {
    try {
      await axios.post('http://localhost:5000/api/settings/fields', { fields: updatedFields });
      setFields(updatedFields);
      if (onFieldsUpdated) onFieldsUpdated(); // מעדכן את ה-AdminDashboard אם צריך
    } catch (err) {
      alert("שגיאה בשמירת השדות");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.addBox}>
        <input 
          placeholder="שם השדה (למשל: כתובת מלאה)" 
          value={newField.label} 
          onChange={e => setNewField({...newField, label: e.target.value})}
          style={styles.input}
        />
        <select 
          value={newField.type} 
          onChange={e => setNewField({...newField, type: e.target.value})}
          style={styles.select}
        >
          <option value="text">טקסט חופשי</option>
          <option value="number">מספר</option>
          <option value="tel">טלפון</option>
          <option value="address">📍 כתובת (מציג מפה)</option>
        </select>
        <button onClick={addField} style={styles.addBtn}>➕ הוסף שדה</button>
      </div>

      <div style={styles.list}>
        <h4 style={{ marginBottom: '15px' }}>שדות פעילים במערכת:</h4>
        {fields.map(field => (
          <div key={field.id} style={styles.fieldItem}>
            <div>
              <span style={styles.labelTag}>{field.label}</span>
              <span style={styles.typeTag}>{field.type === 'address' ? '📍 כתובת' : field.type}</span>
            </div>
            <button 
              onClick={() => removeField(field.id, field.label)} 
              style={styles.deleteBtn}
            >
              🗑️ הסר
            </button>
          </div>
        ))}
        {fields.length === 0 && <p style={{ color: '#95a5a6' }}>טרם הוגדרו שדות.</p>}
      </div>
    </div>
  );
};

// --- אובייקט הסטייל שהיה חסר וגרם לשגיאה ---
const styles = {
  container: { direction: 'rtl', textAlign: 'right' },
  addBox: { 
    display: 'flex', 
    gap: '10px', 
    marginBottom: '30px', 
    padding: '20px', 
    backgroundColor: '#f8f9fa', 
    borderRadius: '10px',
    flexWrap: 'wrap'
  },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1, minWidth: '150px' },
  select: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', cursor: 'pointer' },
  addBtn: { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  list: { backgroundColor: 'white', padding: '15px', borderRadius: '10px' },
  fieldItem: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '12px', 
    borderBottom: '1px solid #f1f1f1' 
  },
  labelTag: { fontWeight: 'bold', marginLeft: '10px', color: '#2c3e50' },
  typeTag: { fontSize: '12px', backgroundColor: '#ecf0f1', padding: '2px 8px', borderRadius: '12px', color: '#7f8c8d' },
  deleteBtn: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

export default FieldManager;