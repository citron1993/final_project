import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/login', credentials);
      
      // חשוב: אנחנו מוודאים שה-Role נמצא בתוך אובייקט המשתמש לצורך ה-ProtectedRoute
      const userData = {
        ...res.data.user,
        role: res.data.role // מוודאים שהתפקיד מוצמד לאובייקט המשתמש
      };

      localStorage.setItem('user', JSON.stringify(userData));

      // ניתוב לפי התפקיד שחזר מהשרת
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/instructor');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'שם משתמש או סיסמה שגויים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <div style={styles.iconCircle}>🔐</div>
        <h2 style={styles.title}>כניסה למערכת</h2>
        
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>שם משתמש</label>
          <input 
            type="text" 
            placeholder="הזן שם משתמש"
            style={styles.input}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>סיסמה</label>
          <input 
            type="password" 
            placeholder="********"
            style={styles.input}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
          />
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'מתחבר...' : 'התחבר עכשיו'}
        </button>
        
        <div style={styles.testInfo}>
          <p style={{margin: '5px 0'}}><strong>סביבת בדיקות</strong></p>
          <p style={{margin: '2px 0'}}>מדריך: israel1 / 123</p>
          <p style={{margin: '2px 0'}}>מנהל: admin / 1234</p>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    backgroundColor: '#f8fafc', 
    direction: 'rtl',
    fontFamily: 'system-ui, sans-serif'
  },
  card: { 
    backgroundColor: 'white', 
    padding: '40px', 
    borderRadius: '24px', 
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
    width: '90%', 
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column'
  },
  iconCircle: {
    width: '60px',
    height: '60px',
    backgroundColor: '#eff6ff',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    margin: '0 auto 15px auto'
  },
  title: { textAlign: 'center', color: '#1e293b', marginBottom: '30px', fontSize: '24px', fontWeight: '800' },
  inputGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#64748b', marginRight: '5px' },
  input: { 
    padding: '14px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0', 
    fontSize: '16px',
    outline: 'none',
    backgroundColor: '#fcfcfc',
    transition: 'border-color 0.2s'
  },
  button: { 
    width: '100%', 
    padding: '14px', 
    marginTop: '10px', 
    borderRadius: '12px', 
    border: 'none', 
    backgroundColor: '#3b82f6', 
    color: 'white', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    transition: 'transform 0.1s'
  },
  error: { 
    backgroundColor: '#fef2f2', 
    color: '#dc2626', 
    padding: '12px', 
    borderRadius: '10px', 
    marginBottom: '20px', 
    textAlign: 'center', 
    fontSize: '14px',
    border: '1px solid #fee2e2'
  },
  testInfo: { 
    marginTop: '30px', 
    fontSize: '13px', 
    color: '#94a3b8', 
    textAlign: 'center', 
    backgroundColor: '#f8fafc',
    padding: '15px',
    borderRadius: '12px'
  }
};

export default Login;

