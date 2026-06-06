import { useState } from 'react';
import axios from 'axios';

// 1. הגדרת העיצובים מחוץ לקומפוננטה כדי שלא יהיו שגיאות Reference
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    direction: 'rtl'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '16px',
    textAlign: 'right'
  },
  button: {
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3498db',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  linkBox: {
    background: '#f8f9fa',
    padding: '10px',
    borderRadius: '4px',
    border: '1px dashed #3498db',
    marginBottom: '10px',
    wordBreak: 'break-all',
    fontSize: '14px'
  },
  copyButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

const QuickRegistration = ({ onClientAdded }) => {
  const [formData, setFormData] = useState({ phone: '', address: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // שליחה לשרת (פורט 5000)
      const res = await axios.post('/api/clients/quick-reg', formData);
      setGeneratedLink(res.data.link);
      if (onClientAdded) onClientAdded();
    } catch (err) {
      console.error(err);
      alert('שגיאה ביצירת טוקן. וודא שהשרת רץ בפורט 5000');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('הקישור הועתק! שלח אותו לדייר');
  };

  return (
    <div style={styles.container}>
      {!generatedLink ? (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ marginTop: 0 }}>רישום מהיר (יצירת טוקן)</h3>
          <input 
            type="tel" 
            placeholder="מספר טלפון" 
            style={styles.input} 
            required
            onChange={e => setFormData({...formData, phone: e.target.value})} 
            value={formData.phone}
          />
          <input 
            type="text" 
            placeholder="כתובת (רחוב ומספר)" 
            style={styles.input} 
            required
            onChange={e => setFormData({...formData, address: e.target.value})} 
            value={formData.address}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'מייצר טוקן...' : 'ייצר קישור להשלמה'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#2ecc71' }}>✅ טוקן נוצר בהצלחה!</h3>
          <p>שלח את הקישור הבא לדייר:</p>
          <div style={styles.linkBox}>{generatedLink}</div>
          <button onClick={copyToClipboard} style={styles.copyButton}>העתק קישור</button>
          <button 
            onClick={() => setGeneratedLink('')} 
            style={{ ...styles.copyButton, backgroundColor: '#95a5a6', marginTop: '10px' }}
          >
            רישום דייר נוסף
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickRegistration;

