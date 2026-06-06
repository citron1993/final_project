import { useState, useEffect } from 'react';
import axios from 'axios';
import InstructorTabs from '../components/Instructor/InstructorTabs';
import QuickRegistration from '../components/Instructor/QuickRegistration';
import ManualRegistration from '../components/Instructor/ManualRegistration';
import InstructorMap from '../components/Instructor/InstructorMap';
import InstructorCalendar from '../components/Instructor/InstructorCalendar';

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('registration');
  const [subReg, setSubReg] = useState('quick');
  const [clients, setClients] = useState([]);
  const [fields, setFields] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [editingClient, setEditingClient] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || { id: 'guest', name: 'אורח' };

  const loadData = async () => {
    try {
      const [clientsRes, fieldsRes] = await Promise.all([
        axios.get('/api/clients'),
        axios.get('/api/settings/fields')
      ]);
      setClients(clientsRes.data);
      setFields(fieldsRes.data);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // תיקון: הפונקציה הזו עכשיו רק מכינה את הנתונים ב-State ולא שומרת בשרת!
  const handleQuickSchedule = (client) => {
    const temporaryClient = {
      ...client,
      instructorId: user.id,
      scheduledDate: new Date().toISOString().split('T')[0], // מציע כברירת מחדל את התאריך של היום במודל
      scheduledTime: "09:00" // מציע כברירת מחדל את השעה 09:00 במודל
    };

    setEditingClient(temporaryClient); // טוען את הפרטים למודל בזיכרון של הדפדפן בלבד
    setActiveTab('calendar'); // מעביר את המדריך לטאב היומן כדי שיראה מתי הוא פנוי
  };

  // כאן מתבצעת השמירה האמיתית בשרת - רק בלחיצה על כפתור השמירה במודל!
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    try {
      // עדכון הסטטוס בהתאם לקוד השרת שלך
      const finalClientData = {
        ...editingClient,
        status: `תואם לתאריך ${editingClient.scheduledDate} בשעה ${editingClient.scheduledTime} 📅`
      };

      await axios.put(`/api/clients/${editingClient.id}`, finalClientData);
      alert("השיבוץ נשמר בהצלחה! 📅");
      loadData(); // רענון הנתונים
      setEditingClient(null); // סגירת המודל
    } catch { 
      alert("שגיאה בעדכון הפרטים"); 
    }
  };

  const handleCompleteLesson = async (clientId) => {
    if(!window.confirm("האם לסמן את ההדרכה כבוצעה?")) return;
    try {
      await axios.patch(`/api/clients/${clientId}/complete`);
      alert("ההדרכה בוצעה בהצלחה! ✅");
      loadData();
      setEditingClient(null);
    } catch { alert("שגיאה בעדכון הסטטוס"); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'registration':
        return (
          <div style={styles.registrationWrapper}>
            <div style={styles.subRegNav}>
              <button onClick={() => setSubReg('quick')} style={subReg === 'quick' ? styles.activeSub : styles.subBtn}>⚡ רישום מהיר (טוקן)</button>
              <button onClick={() => setSubReg('manual')} style={subReg === 'manual' ? styles.activeSub : styles.subBtn}>📝 רישום ידני מלא</button>
            </div>
            <div style={styles.formContainer}>
              {subReg === 'quick' ? <QuickRegistration onClientAdded={loadData} /> : <ManualRegistration onClientAdded={loadData} />}
            </div>
          </div>
        );

      case 'clients': {
        const unassigned = clients.filter(c => 
          !c.instructorId && 
          (`${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (c.address || '').toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return (
          <div style={styles.tabContainer}>
            <div style={styles.tabHeader}>
              <h2 style={styles.title}>דיירים ממתינים ({unassigned.length})</h2>
              <input 
                type="text" placeholder="🔍 חיפוש..." style={styles.searchInput}
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={styles.cardGrid}>
              {unassigned.map(client => (
                <div key={client.id} style={styles.workCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.avatar}>{client.firstName ? client.firstName[0] : 'ד'}</div>
                    <div>
                      <h3 style={styles.clientName}>{client.firstName} {client.lastName}</h3>
                      <span style={styles.cardTag}>חדש במערכת</span>
                    </div>
                  </div>
                  <div style={styles.cardBody}>
                    <p style={styles.clientDetail}>📍 {client.address || 'אין כתובת'}</p>
                    <p style={styles.clientDetail}>📞 {client.phone}</p>
                  </div>
                  <div style={styles.cardActions}>
                    <a href={`https://wa.me/972${client.phone?.replace(/^0/, '')}`} target="_blank" rel="noreferrer" style={styles.actionBtnWhatsapp}>WhatsApp</a>
                    <button onClick={() => handleQuickSchedule(client)} style={styles.actionBtnSchedule}>📅 שבץ אותי</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'calendar': {
        const myLessons = clients.filter(c => c.instructorId === user.id);
        const filteredLessons = myLessons.filter(c => 
          filterStatus === 'all' || (filterStatus === 'pending' ? !c.isTrained : c.isTrained)
        );

        return (
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={styles.card}>
              <div style={styles.calendarHeader}>
                <h2 style={styles.title}>📅 לוח ההדרכות שלי</h2>
                <div style={styles.filterBar}>
                    <button onClick={() => setFilterStatus('all')} style={filterStatus === 'all' ? styles.activeFilter : styles.filterBtn}>הכל</button>
                    <button onClick={() => setFilterStatus('pending')} style={filterStatus === 'pending' ? styles.activeFilter : styles.filterBtn}>ממתין</button>
                    <button onClick={() => setFilterStatus('completed')} style={filterStatus === 'completed' ? styles.activeFilter : styles.filterBtn}>בוצעו</button>
                </div>
              </div>
              <InstructorCalendar clients={filteredLessons} onUpdateClient={setEditingClient} />
            </div>
          </div>
        );
      }

      case 'map':
        return (
          <div style={styles.card}>
            <h2 style={styles.title}>מפת דיירים 📍</h2>
            <InstructorMap clients={clients.filter(c => !c.instructorId && c.lat)} addressFieldId={fields.find(f => f.type === 'address')?.id} />
          </div>
        );

      default: return null;
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
            <div style={styles.userBadge}>שלום, <strong>{user.name}</strong></div>
            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={styles.logoutBtn}>התנתק</button>
        </div>
        <InstructorTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>

      <main style={{ padding: '20px' }}>{renderContent()}</main>

      {editingClient && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>עדכון הדרכה: {editingClient.firstName || 'דייר'}</h3>
            <form onSubmit={handleSaveDetails} style={styles.modalForm}>
              <div style={styles.inputGroupRow}>
                <div style={styles.inputItem}>
                  <label style={styles.label}>תאריך:</label>
                  <input style={styles.modalInput} type="date" value={editingClient.scheduledDate || ''} onChange={e => setEditingClient({...editingClient, scheduledDate: e.target.value})} required />
                </div>
                <div style={styles.inputItem}>
                  <label style={styles.label}>שעה:</label>
                  <input style={styles.modalInput} type="time" value={editingClient.scheduledTime || ''} onChange={e => setEditingClient({...editingClient, scheduledTime: e.target.value})} required />
                </div>
              </div>
              
              <div style={styles.modalButtonsStack}>
                <button type="submit" style={styles.saveBtn}>💾 שמור שינויים</button>
                {/* כפתור סיום יוצג רק אם מדובר בדייר שכבר שמור במערכת עם הדרכה פעילה (לא בשיבוץ חדש לגמרי) */}
                {editingClient.id && clients.some(c => c.id === editingClient.id && c.instructorId) && !editingClient.isTrained && (
                  <button type="button" onClick={() => handleCompleteLesson(editingClient.id)} style={styles.completeBtn}>✅ סיום הדרכה (בוצע)</button>
                )}
              </div>
              <button type="button" onClick={() => setEditingClient(null)} style={styles.cancelLink}>ביטול וסגירה</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' },
  header: { backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 },
  headerTop: { display: 'flex', justifyContent: 'space-between', padding: '12px 25px', alignItems: 'center' },
  userBadge: { background: '#f1f5f9', padding: '6px 15px', borderRadius: '20px', fontSize: '14px' },
  logoutBtn: { background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  registrationWrapper: { maxWidth: '650px', margin: '0 auto' },
  subRegNav: { display: 'flex', gap: '0', backgroundColor: '#e2e8f0', padding: '5px', borderRadius: '12px', marginBottom: '25px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' },
  subBtn: { flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', color: '#64748b', borderRadius: '8px', transition: 'all 0.2s' },
  activeSub: { flex: 1, padding: '12px', border: 'none', backgroundColor: '#fff', color: '#3b82f6', fontWeight: 'bold', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  formContainer: { backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  tabContainer: { maxWidth: '1200px', margin: '0 auto' },
  tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  searchInput: { padding: '10px 20px', borderRadius: '25px', border: '1px solid #e2e8f0', width: '300px', outline: 'none' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' },
  workCard: { backgroundColor: '#fff', borderRadius: '15px', padding: '20px', border: '1px solid #e2e8f0' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  avatar: { width: '45px', height: '45px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' },
  clientName: { margin: 0, fontSize: '18px', color: '#1e293b' },
  cardTag: { fontSize: '11px', background: '#f0fdf4', color: '#166534', padding: '2px 10px', borderRadius: '20px', fontWeight: '600' },
  clientDetail: { margin: '6px 0', fontSize: '14px', color: '#64748b' },
  cardActions: { display: 'flex', gap: '10px', marginTop: '20px' },
  actionBtnWhatsapp: { flex: 1, textAlign: 'center', background: '#22c55e', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' },
  actionBtnSchedule: { flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' },
  filterBar: { display: 'flex', gap: '5px', background: '#f1f5f9', padding: '5px', borderRadius: '10px' },
  filterBtn: { border: 'none', background: 'none', padding: '7px 15px', cursor: 'pointer', fontSize: '14px', color: '#64748b' },
  activeFilter: { background: '#fff', borderRadius: '7px', fontWeight: 'bold', color: '#1e293b', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: '#fff', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalTitle: { marginTop: 0, marginBottom: '20px', textAlign: 'center', color: '#1e293b' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroupRow: { display: 'flex', gap: '15px' },
  inputItem: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  modalInput: { padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' },
  modalButtonsStack: { display: 'flex', flexDirection: 'column', gap: '10px' },
  saveBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' },
  completeBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' },
  cancelLink: { textAlign: 'center', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }
};

export default InstructorDashboard;

