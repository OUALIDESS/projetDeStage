// Navbar.jsx
import React from 'react';


const headerColor = '#ffffff';

export default function Navbar({ collapsed, sidebarWidth }) {
  return (
    <nav
      className="d-flex justify-content-between align-items-center px-4"
      style={{
        position: 'fixed',
        top: 0,
        left: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
        height: '60px',
        backgroundColor: headerColor,
        zIndex: 1001,
        transition: 'left 0.3s, width 0.3s'
        // pas de borderBottom
      }}
    >
      <div />
      
    </nav>
  );
}
