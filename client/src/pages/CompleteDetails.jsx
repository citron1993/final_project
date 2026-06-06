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
        // 1. ×˜×¢×™× ×ª ×”×’×“×¨×•×ª ×”×©×“×•×ª ×ž×”×ž× ×”×œ
        const fieldsRes = await axios.get('/api/settings/fields');
        setFields(fieldsRes.data);

        // 2. ×˜×¢×™× ×ª × ×ª×•× ×™ ×”×œ×§×•×— ×”×§×™×™×ž×™× (××œ×• ×©×”×ž×“×¨×™×š ×”×–×™×Ÿ ×ž×¨××©)
        const clientRes = await axios.get(`/api/clients/by-token/${token}`);
        setFormData(clientRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        alert("×”×§×™×©×•×¨ ××™× ×• ×ª×§×£ ××• ×©×¤×’ ×ª×•×§×¤×•");
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
        `×”×©×“×•×ª ×”×‘××™× ×¨×™×§×™×: ${fieldNames}. ×”×× ×œ×”×ž×©×™×š ×‘×›×œ ×–××ª?`
      );

      if (!approved) {
        return;
      }
    }

    try {
      // ×©×œ×™×—×ª ×›×œ ×”-formData (×›×•×œ×œ ×”×©×“×•×ª ×”× ×¢×•×œ×™×) ×—×–×¨×” ×œ×©×¨×ª
      await axios.post(`/api/clients/complete-by-token/${token}`, formData);
      setSubmitted(true);
    } catch {
      alert("×©×’×™××” ×‘×©×œ×™×—×ª ×”×¤×¨×˜×™×");
    }
  };

  if (loading) return <div style={styles.message}>×˜×•×¢×Ÿ ×¤×¨×˜×™×...</div>;
  if (submitted) return <div style={styles.message}>âœ… ×”×¤×¨×˜×™× × ×©×œ×—×• ×‘×”×¦×œ×—×”! × ×™×¦×•×¨ ××™×ª×š ×§×©×¨ ×‘×”×§×“×.</div>;

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>×”×©×œ×ž×ª ×¤×¨×˜×™ ×¨×™×©×•×</h2>
        <p style={styles.subtitle}>×× × ×ž×œ× ××ª ×”×¤×¨×˜×™× ×”×—×¡×¨×™× ×›×“×™ ×©× ×•×›×œ ×œ×ª×× ×”×“×¨×›×”</p>
        
        {fields.map(field => {
          // ×‘×“×™×§×” ×”×× ×”×©×“×” ×¦×¨×™×š ×œ×”×™×•×ª × ×¢×•×œ (×˜×œ×¤×•×Ÿ ××• ×›×ª×•×‘×ª)
          const isLocked = field.id === 'phone' || field.type === 'address';

          return (
            <div key={field.id} style={styles.fieldGroup}>
              <label style={styles.label}>
                {field.label}
                {isLocked && <span style={styles.lockedLabel}> (×©×“×” ×ž××•×ž×ª)</span>}
              </label>
              <input
                type={field.type === 'address' ? 'text' : field.type}
                value={formData[field.id] || ''}
                onChange={(e) => !isLocked && setFormData({ ...formData, [field.id]: e.target.value })}
                aria-required={field.required}
                disabled={isLocked} // × ×¢×™×œ×ª ×”×©×“×”
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
        
        <button type="submit" style={styles.button}>××™×©×•×¨ ×•×©×œ×™×—×ª ×¤×¨×˜×™×</button>
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

