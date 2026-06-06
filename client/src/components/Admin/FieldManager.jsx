import { useEffect, useState } from 'react';
import axios from 'axios';

const FieldManager = ({ onFieldsUpdated }) => {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ label: '', type: 'text', required: true });

  async function fetchFields() {
    try {
      const res = await axios.get('/api/settings/fields?includeInactive=true');
      setFields(res.data || []);
    } catch (err) {
      console.error('Error fetching fields:', err);
    }
  }

  useEffect(() => {
    fetchFields();
  }, []);

  const addField = async () => {
    const label = newField.label.trim();

    if (!label) {
      window.alert('חובה להזין שם לשדה');
      return;
    }

    const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const id = `field_${safeLabel || 'custom'}_${fields.length + 1}`;
    const updatedFields = [...fields, { ...newField, label, id, isActive: true }];

    await saveFields(updatedFields);
    setNewField({ label: '', type: 'text', required: true });
  };

  const toggleFieldStatus = async (id, isActive) => {
    const nextStatus = !isActive;
    const message = nextStatus
      ? 'להפעיל את השדה מחדש?'
      : 'להקפיא את השדה? הוא לא יופיע יותר בטפסי מילוי, אבל הנתונים הקיימים לא יימחקו.';

    if (!window.confirm(message)) {
      return;
    }

    const updatedFields = fields.map((field) => (
      field.id === id ? { ...field, isActive: nextStatus } : field
    ));

    await saveFields(updatedFields);
  };

  const saveFields = async (updatedFields) => {
    try {
      await axios.post('/api/settings/fields', { fields: updatedFields });
      setFields(updatedFields);

      if (onFieldsUpdated) {
        onFieldsUpdated();
      }
    } catch {
      window.alert('שגיאה בשמירת השדות');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.addBox}>
        <input
          placeholder="שם השדה (למשל: כתובת מלאה)"
          value={newField.label}
          onChange={(e) => setNewField({ ...newField, label: e.target.value })}
          style={styles.input}
        />
        <select
          value={newField.type}
          onChange={(e) => setNewField({ ...newField, type: e.target.value })}
          style={styles.select}
        >
          <option value="text">טקסט חופשי</option>
          <option value="number">מספר</option>
          <option value="tel">טלפון</option>
          <option value="email">אימייל</option>
          <option value="address">כתובת (מציג מפה)</option>
        </select>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={newField.required}
            onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
          />
          שדה חובה
        </label>
        <button onClick={addField} style={styles.addBtn}>הוסף שדה</button>
      </div>

      <div style={styles.list}>
        <h4 style={{ marginBottom: '15px' }}>שדות במערכת:</h4>
        {fields.map((field) => {
          const isActive = field.isActive !== false;

          return (
            <div key={field.id} style={{ ...styles.fieldItem, opacity: isActive ? 1 : 0.6 }}>
              <div>
                <span style={styles.labelTag}>{field.label}</span>
                <span style={styles.typeTag}>{field.type === 'address' ? 'כתובת' : field.type}</span>
                <span style={isActive ? styles.activeTag : styles.frozenTag}>
                  {isActive ? 'פעיל' : 'מוקפא'}
                </span>
              </div>
              <button
                onClick={() => toggleFieldStatus(field.id, isActive)}
                style={isActive ? styles.freezeBtn : styles.activateBtn}
              >
                {isActive ? 'הקפא' : 'הפעל'}
              </button>
            </div>
          );
        })}
        {fields.length === 0 && <p style={{ color: '#95a5a6' }}>טרם הוגדרו שדות.</p>}
      </div>
    </div>
  );
};

const styles = {
  container: { direction: 'rtl', textAlign: 'right' },
  addBox: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1, minWidth: '150px' },
  select: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', cursor: 'pointer' },
  checkboxLabel: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34495e', fontSize: '14px' },
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
  typeTag: { fontSize: '12px', backgroundColor: '#ecf0f1', padding: '2px 8px', borderRadius: '12px', color: '#7f8c8d', marginLeft: '8px' },
  activeTag: { fontSize: '12px', backgroundColor: '#eafaf1', padding: '2px 8px', borderRadius: '12px', color: '#1e8449' },
  frozenTag: { fontSize: '12px', backgroundColor: '#f4f6f7', padding: '2px 8px', borderRadius: '12px', color: '#7f8c8d' },
  freezeBtn: { backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  activateBtn: { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

export default FieldManager;
