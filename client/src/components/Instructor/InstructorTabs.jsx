import React from 'react';

const InstructorTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'registration', label: 'רישום', icon: '📝' },
    { id: 'clients', label: 'דיירים', icon: '👥' },
    { id: 'map', label: 'מפה', icon: '📍' },
    { id: 'calendar', label: 'יומן', icon: '📅' }
  ];

  return (
    <div style={tabsContainerStyle}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={activeTab === tab.id ? activeTabStyle : tabStyle}
        >
          <span style={{ marginLeft: '5px' }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// --- עיצובים ---
const tabsContainerStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  backgroundColor: '#fff',
  borderBottom: '2px solid #ddd',
  position: 'sticky',
  top: '0',
  zIndex: '100',
  direction: 'rtl'
};

const tabStyle = {
  flex: 1,
  padding: '15px 5px',
  border: 'none',
  background: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#7f8c8d',
  cursor: 'pointer',
  transition: '0.3s',
  borderBottom: '3px solid transparent'
};

const activeTabStyle = {
  ...tabStyle,
  color: '#3498db',
  borderBottom: '3px solid #3498db'
};

export default InstructorTabs;