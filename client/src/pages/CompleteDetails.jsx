import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CompleteDetails = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState({});
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. טעינת הגדרות השדות מהמנהל
        const fieldsRes = await axios.get('http://localhost:5000/api/settings/fields');
        setFields(fieldsRes.data);

        // 2. טעינת נתוני הלקוח הקיימים (אלו שהמדריך הזין מראש)
        const clientRes = await axios.get(`http://localhost:5000/api/clients/by-token/${token}`);
        setFormData(clientRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        alert("הקישור אינו תקף או שפג תוקפו");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emptyRequiredFields = fields.filter(field => (
      field.required && !String(formData[field.id] || '').trim()
    ));

    if (emptyRequiredFields.length > 0) {
      const fieldNames = emptyRequiredFields.map(field => field.label).join(', ');
      const approved = window.confirm(
        `השדות הבאים ריקים: ${fieldNames}. האם להמשיך בכל זאת?`
      );

      if (!approved) {
        return;
      }
    }

    try {
      // שליחת כל ה-formData (כולל השדות הנעולים) חזרה לשרת
      await axios.post(`http://localhost:5000/api/clients/complete-by-token/${token}`, formData);
      setSubmitted(true);
    } catch (err) {
      alert("שגיאה בשליחת הפרטים");
    }
  };

  if (loading) return <div style={styles.message}>טוען פרטים...</div>;
  if (submitted) return <div style={styles.message}>✅ הפרטים נשלחו בהצלחה! ניצור איתך קשר בהקדם.</div>;

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>השלמת פרטי רישום</h2>
        <p style={styles.subtitle}>אנא מלא את הפרטים החסרים כדי שנוכל לתאם הדרכה</p>
        
        {fields.map(field => {
          // בדיקה האם השדה צריך להיות נעול (טלפון או כתובת)
          const isLocked = field.id === 'phone' || field.type === 'address';

          return (
            <div key={field.id} style={styles.fieldGroup}>
              <label style={styles.label}>
                {field.label}
                {isLocked && <span style={styles.lockedLabel}> (שדה מאומת)</span>}
              </label>
              <input
                type={field.type === 'address' ? 'text' : field.type}
                value={formData[field.id] || ''}
                onChange={(e) => !isLocked && setFormData({ ...formData, [field.id]: e.target.value })}
                aria-required={field.required}
                disabled={isLocked} // נעילת השדה
                style={{
                  ...styles.input,
                  backgroundColor: isLocked ? '#f5f6fa' : 'white',
                  color: isLocked ? '#7f8c8d' : '#2c3e50',
                  cursor: isLocked ? 'not-allowed' : 'text',
                  border: isLocked ? '1px solid #dcdde1' : '1px solid #3498db'
                }}
              />
            </div>
          );
        })}
        
        <button type="submit" style={styles.button}>אישור ושליחת פרטים</button>
      </form>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', direction: 'rtl', padding: '20px' },
  card: { backgroundColor: 'white', padding: '35px', borderRadius: '15px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '450px' },
  title: { textAlign: 'center', color: '#2c3e50', marginBottom: '10px', fontSize: '24px' },
  subtitle: { textAlign: 'center', color: '#7f8c8d', marginBottom: '30px', fontSize: '14px' },
  fieldGroup: { marginBottom: '18px', display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '6px', fontWeight: 'bold', color: '#34495e', fontSize: '15px' },
  lockedLabel: { fontSize: '11px', color: '#95a5a6', fontWeight: 'normal' },
  input: { padding: '12px', borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border 0.2s' },
  button: { width: '100%', padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' },
  message: { textAlign: 'center', marginTop: '100px', fontSize: '22px', fontWeight: 'bold', direction: 'rtl', color: '#2c3e50' }
};

export default CompleteDetails;
