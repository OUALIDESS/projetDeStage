import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Layouts/SideBar';
import Navbar from './Layouts/Navbar';
import Footer from './Layouts/Footer';
import Dashboard from './pages/Dashboard';
import DAEC from './pages/divisions/DAEC';
import DAI from './pages/divisions/DAI';
import DAS from './pages/divisions/DAS';
import DCT from './pages/divisions/DCT';
import DFL from './pages/divisions/DFL';
import DPE from './pages/divisions/DPE';
import DRHF from './pages/divisions/DRHF';
import DUE from './pages/divisions/DUE';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ChefDivisions from './pages/ChefDivisions';
import GradeEmployes from './pages/GradeEmployes';
import EmployeeDetails from './pages/EmployeeDetails';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const sidebarWidth = collapsed ? 60 : 240;
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

  const isLoginPage = location.pathname === '/login';

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
                    padding: '24px',
                    marginTop: '60px',
                    position: 'relative',
                    marginBottom: '60px',
                    backgroundColor: 'var(--background-color)',
                  }}
                >
                  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/login" replace />} />
                      <Route path="/pages/Dashboard" element={<Dashboard theme={theme} />} />
                      <Route path="/pages/divisions/DAEC" element={<DAEC theme={theme} />} />
                      <Route path="/pages/divisions/DAI" element={<DAI theme={theme} />} />
                      <Route path="/pages/divisions/DAS" element={<DAS theme={theme} />} />
                      <Route path="/pages/divisions/DCT" element={<DCT theme={theme} />} />
                      <Route path="/pages/divisions/DFL" element={<DFL theme={theme} />} />
                      <Route path="/pages/divisions/DPE" element={<DPE theme={theme} />} />
                      <Route path="/pages/divisions/DRHF" element={<DRHF theme={theme} />} />
                      <Route path="/pages/divisions/DUE" element={<DUE theme={theme} />} />
                      <Route path="/pages/ChefDivisions" element={<ChefDivisions theme={theme} />} />
                      <Route
                        path="/pages/Employees"
                        element={<Employees theme={theme} addNotification={addNotification} />}
                      />
                      <Route path="/employee/:id" element={<EmployeeDetails theme={theme} />} />
                      <Route path="/pages/GradeEmployes" element={<GradeEmployes theme={theme} />} />
                      <Route path="/pages/settings" element={<Settings theme={theme} />} />
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