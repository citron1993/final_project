import { useState, useEffect } from 'react';
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
        const fieldsRes = await axios.get('/api/settings/fields');
        setFields(fieldsRes.data);

        const clientRes = await axios.get(`/api/clients/by-token/${token}`);
        setFormData(clientRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        alert("שגיאה בטעינת הנתונים או קישור לא תקין");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emptyRequiredFields = fields.filter(field =>
      field.required && !String(formData[field.id] || '').trim()
    );

    if (emptyRequiredFields.length > 0) {
      const fieldNames = emptyRequiredFields.map(f => f.label).join(', ');

      const approved = window.confirm(
        `השדות הבאים חסרים: ${fieldNames}. האם להמשיך בכל זאת?`
      );

      if (!approved) return;
    }

    try {
      await axios.post(`/api/clients/complete-by-token/${token}`, formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("שגיאה בשליחת הפרטים");
    }
  };

  if (loading) {
    return <div style={styles.message}>טוען פרטים...</div>;
  }

  if (submitted) {
    return (
      <div style={styles.message}>
        ✅ הפרטים נשלחו בהצלחה! ניתן לסגור את החלון.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>השלמת פרטי רישום</h2>
        <p style={styles.subtitle}>
          אנא מלא את הפרטים החסרים כדי להשלים את התהליך
        </p>

        {fields.map(field => {
          const isLocked = field.id === 'phone' || field.type === 'address';

          return (
            <div key={field.id} style={styles.fieldGroup}>
              <label style={styles.label}>
                {field.label}
                {isLocked && (
                  <span style={styles.lockedLabel}> (שדה נעול)</span>
                )}
              </label>

              <input
                type={field.type === 'address' ? 'text' : field.type}
                value={formData[field.id] || ''}
                onChange={(e) =>
                  !isLocked &&
                  setFormData({
                    ...formData,
                    [field.id]: e.target.value
                  })
                }
                disabled={isLocked}
                style={{
                  ...styles.input,
                  backgroundColor: isLocked ? '#f5f6fa' : '#fff',
                  color: isLocked ? '#7f8c8d' : '#2c3e50',
                  cursor: isLocked ? 'not-allowed' : 'text'
                }}
              />
            </div>
          );
        })}

        <button type="submit" style={styles.button}>
          אישור ושליחת פרטים
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    direction: 'rtl',
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '35px',
    borderRadius: '15px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
    color: '#2c3e50'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#7f8c8d',
    fontSize: '14px'
  },
  fieldGroup: {
    marginBottom: '15px'
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '5px',
    display: 'block',
    color: '#34495e'
  },
  lockedLabel: {
    fontSize: '12px',
    color: '#95a5a6'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    marginTop: '15px',
    cursor: 'pointer'
  },
  message: {
    textAlign: 'center',
    marginTop: '100px',
    fontSize: '20px',
    color: '#2c3e50'
  }
};

export default CompleteDetails;