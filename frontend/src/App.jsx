import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Layouts/SideBar';
import Navbar from './Layouts/Navbar';
import Footer from './Layouts/Footer';
import Dashboard from './pages/Dashboard';
import DivisionPage from './pages/divisions/DivisionPage';
import Employees from './pages/Employees';
import Settings from './pages/Historique';
import Login from './pages/Login';
import ChefDivisions from './pages/ChefDivisions';
import GradeEmployes from './pages/GradeEmployes';
import EmployeeDetails from './pages/EmployeeDetails';
import Note from './pages/Note';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const sidebarWidth = collapsed ? 50 : 200;
  const location = useLocation();

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const addNotification = (type, data) => {
    const newNotification = {
      id: Date.now(),
      type,
      data,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [...prev, newNotification]);
    setNotificationCount((prev) => prev + 1);
  };

  const markNotificationsAsRead = () => {
    setNotificationCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  return (
    <div
      className={`app ${theme}`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        '--navbar-bg': theme === 'dark' ? '#14131f' : '#ffffff',
        '--text-color': theme === 'dark' ? '#e0e0e0' : '#212529',
        '--card-bg': theme === 'dark' ? '#2a2a3a' : '#ffffff',
        '--border-color': theme === 'dark' ? '#3a3a4a' : '#dee2e6',
        '--muted-color': theme === 'dark' ? '#a0a0a0' : '#6c757d',
        '--primary-color': theme === 'dark' ? '#6b46c1' : '#0d6efd',
        '--shadow-color': theme === 'dark' ? 'rgba(20, 19, 31, 0.5)' : 'rgba(0, 0, 0, 0.1)',
        '--background-color': theme === 'dark' ? '#14131f' : '#ffffff',
        '--secondary-bg': theme === 'dark' ? '#2a2a3a' : '#f8f9fa',
        '--accent-color': theme === 'dark' ? '#6b46c1' : '#0d6efd',
        '--web-black': theme === 'dark' ? '#1a1a1a' : '#000000',
      }}
    >
      <Routes>
        <Route path="/login" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
        <Route
          path="/*"
          element={
            <>
              <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 1000 }}>
                <Sidebar
                  collapsed={collapsed}
                  onToggle={() => setCollapsed(!collapsed)}
                  theme={theme}
                  toggleTheme={toggleTheme}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  marginLeft: `${sidebarWidth}px`,
                  transition: 'margin-left 0.3s ease',
                  height: '100vh',
                  backgroundColor: 'var(--background-color)',
                }}
              >
                <div style={{ position: 'fixed', top: 0, left: `${sidebarWidth}px`, right: 0, zIndex: 100 }}>
                  <Navbar
                    collapsed={collapsed}
                    sidebarWidth={sidebarWidth}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    notifications={notifications}
                    notificationCount={notificationCount}
                    markNotificationsAsRead={markNotificationsAsRead}
                    clearNotifications={clearNotifications}
                  />
                </div>
                <main
                  style={{
                    flex: 1,
                    padding: '0 24px 24px',
                    marginTop: '60px',
                    position: 'relative',
                    marginBottom: '60px',
                    backgroundColor: 'var(--background-color)',
                  }}
                >
                  <div style={{ margin: '0 auto' }}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/login" replace />} />
                      <Route path="/pages/Dashboard" element={<Dashboard theme={theme} />} />
                      <Route
                        path="/pages/divisions/:divisionName"
                        element={<DivisionPage theme={theme} />}
                      />
                      <Route path="/pages/ChefDivisions" element={<ChefDivisions theme={theme} />} />
                      <Route path="/pages/Note" element={<Note theme={theme} />} />
                      <Route
                        path="/pages/Employees"
                        element={<Employees theme={theme} addNotification={addNotification} collapsed={collapsed} />}
                      />
                      <Route
                        path="/pages/EmployeeDetails/:id"
                        element={<EmployeeDetails theme={theme} />}
                      />
                      <Route path="/pages/GradeEmployes" element={<GradeEmployes theme={theme} />} />
                      <Route path="/pages/Historique" element={<Settings theme={theme} />} />
                      <Route path="*" element={<Navigate to="/pages/Dashboard" replace />} />
                    </Routes>
                  </div>
                </main>
                <Footer collapsed={collapsed} sidebarWidth={sidebarWidth} theme={theme} />
              </div>
            </>
          }
        />
      </Routes>
    </div>
  );
}