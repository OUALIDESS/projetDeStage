import React, { useState } from 'react';
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
import Logout from './pages/Logout';
import Login from './pages/Login';
import ChefDivisions from './pages/ChefDivisions';
import GradeEmployes from './pages/GradeEmployes';
import EmployeeDetails from "./pages/EmployeeDetails";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 60 : 240;
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/*"
        element={
          <div style={{ 
            display: 'flex', 
            minHeight: '100vh'
          }}>
            {/* Sidebar Container */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              zIndex: 1000,
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
            }}>
              <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            </div>

            {/* Main Content Area */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              marginLeft: `${sidebarWidth}px`,
              transition: 'margin-left 0.3s ease',
              height: '100vh'
            }}>
              {/* Navbar */}
              <div style={{
                position: 'fixed',
                top: 0,
                left: `${sidebarWidth}px`,
                right: 0,
                zIndex: 100,
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'left 0.3s ease'
              }}>
                <Navbar collapsed={collapsed} sidebarWidth={sidebarWidth} />
              </div>

              {/* Content */}
              <main style={{
                flex: 1,
                padding: '24px',
                marginTop: '60px', /* Adjust based on navbar height */
                position: 'relative',
                backgroundColor: "#f2f2f2"
              }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                  <Routes>
                    <Route path="/pages/Dashboard" element={<Dashboard />} />
                    <Route path="/pages/divisions/DAEC" element={<DAEC/>}/>
                    <Route path="/pages/divisions/DAI" element={<DAI/>}/>
                    <Route path="/pages/divisions/DAS" element={<DAS/>}/>
                    <Route path="/pages/divisions/DCT" element={<DCT/>}/>
                    <Route path="/pages/divisions/DFL" element={<DFL/>}/>
                    <Route path="/pages/divisions/DPE" element={<DPE/>}/>
                    <Route path="/pages/divisions/DRHF" element={<DRHF/>}/>
                    <Route path="/pages/divisions/DUE" element={<DUE/>}/>
                    <Route path="/pages/ChefDivisions" element={<ChefDivisions/>}/>
                    <Route path="/pages/Employees" element={<Employees />} />
                    <Route path="/employee/:id" element={<EmployeeDetails />} />
                    <Route path="/pages/GradeEmployes" element={<GradeEmployes />} />
                    <Route path="/pages/settings" element={<Settings />} />
                    <Route path="/pages/Logout" element={<Logout />} />
                    <Route path="*" element={<Navigate to="/pages/Dashboard" replace />} />
                  </Routes>
                </div>
              </main>

              {/* Footer */}
              <Footer collapsed={collapsed} sidebarWidth={sidebarWidth} />
            </div>
          </div>
        }
      />
    </Routes>
  );
}