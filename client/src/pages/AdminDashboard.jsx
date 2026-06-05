import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InstructorManager from '../components/Admin/InstructorManager';
import ClientsTable from '../components/Admin/ClientsTable';
import FieldManager from '../components/Admin/FieldManager';
import StatsCards from '../components/Admin/StatsCards';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [clients, setClients] = useState([]);
  const [fields, setFields] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [stats, setStats] = useState(null);

  const loadAllData = async () => {
    try {
      const [clientsRes, fieldsRes, instructorsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/clients'),
        axios.get('http://localhost:5000/api/settings/fields'),
        axios.get('http://localhost:5000/api/instructors'),
        axios.get('http://localhost:5000/api/stats')
      ]);
      setClients(clientsRes.data);
      setFields(fieldsRes.data);
      setInstructors(instructorsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return (
          <div style={styles.fadeAnim}>
            <h3 style={styles.contentTitle}>📊 מבט על ומדדים</h3>
            {stats ? (
              <StatsCards stats={stats} clients={clients} instructors={instructors} />
            ) : (
              <p>טוען נתונים...</p>
            )}
          </div>
        );
      case 'instructors':
        return (
          <div style={styles.card}>
            <h3 style={styles.contentTitle}>👥 ניהול צוות המדריכים</h3>
            <InstructorManager onInstructorsUpdated={loadAllData} />
          </div>
        );
      case 'allClients':
        return (
          <div style={styles.card}>
            <h3 style={styles.contentTitle}>📇 מאגר דיירים</h3>
            <ClientsTable clients={clients} fields={fields} instructors={instructors} />
          </div>
        );
      case 'formSettings':
        return (
          <div style={styles.card}>
            <h3 style={styles.contentTitle}>⚙️ הגדרות מערכת וטפסים</h3>
            <FieldManager onFieldsUpdated={loadAllData} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.page}>
      {/* Header עליון עם ניווט מאוזן */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <h2 style={styles.logo}>לוח בקרה מנהל</h2>
          <button 
            style={styles.logoutBtn} 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          >
            יציאה מהמערכת
          </button>
        </div>

        <nav style={styles.tabsNav}>
          <button 
            style={activeTab === 'stats' ? styles.activeTabBtn : styles.tabBtn} 
            onClick={() => setActiveTab('stats')}
          >
            דשבורד
          </button>
          <button 
            style={activeTab === 'instructors' ? styles.activeTabBtn : styles.tabBtn} 
            onClick={() => setActiveTab('instructors')}
          >
            מדריכים
          </button>
          <button 
            style={activeTab === 'allClients' ? styles.activeTabBtn : styles.tabBtn} 
            onClick={() => setActiveTab('allClients')}
          >
            דיירים
          </button>
          <button 
            style={activeTab === 'formSettings' ? styles.activeTabBtn : styles.tabBtn} 
            onClick={() => setActiveTab('formSettings')}
          >
            הגדרות שדות
          </button>
        </nav>
      </header>
      
      {/* אזור התוכן */}
      <main style={styles.main}>
        {renderContent()}
      </main>
    </div>
  );
};

const styles = {
  page: { direction: 'rtl', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Segoe UI' },
  header: { backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' },
  logo: { margin: 0, fontSize: '20px', color: '#2c3e50' },
  logoutBtn: { backgroundColor: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', transition: '0.3s' },
  tabsNav: { display: 'flex', gap: '5px', marginTop: '5px', overflowX: 'auto', paddingBottom: '2px' },
  tabBtn: { padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', color: '#7f8c8d', borderBottom: '3px solid transparent', transition: '0.2s', whiteSpace: 'nowrap' },
  activeTabBtn: { padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', color: '#3498db', borderBottom: '3px solid #3498db', fontWeight: 'bold', whiteSpace: 'nowrap' },
  main: { padding: '16px', maxWidth: '1200px', margin: '0 auto' },
  contentTitle: { marginBottom: '20px', color: '#34495e', fontSize: '18px' },
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  fadeAnim: { animation: 'fadeIn 0.5s ease-in' }
};

export default AdminDashboard;
