import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CompleteDetails from './pages/CompleteDetails';

// קומפוננטה פשוטה להגנה על נתיבים
const ProtectedRoute = ({ children, roleRequired }) => {
  const userString = localStorage.getItem('user');
  
  // אם אין משתמש במערכת
  if (!userString) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userString);
    // בדיקת תפקיד - אם המשתמש לא בתפקיד המתאים, נחזיר אותו ללוגין
    if (roleRequired && user.role !== roleRequired) {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (e) {
    return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', direction: 'rtl' }}>
        <Routes>
          {/* דף לוגין */}
          <Route path="/" element={<Login />} />
          
          {/* דף מנהל מוגן */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* דף מדריך מוגן */}
          <Route 
            path="/instructor" 
            element={
              <ProtectedRoute roleRequired="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/complete-details/:token" element={<CompleteDetails />} />
          
          {/* ברירת מחדל - חזרה ללוגין */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;