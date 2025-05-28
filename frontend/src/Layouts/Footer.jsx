import React from 'react';

const Footer = ({ collapsed, sidebarWidth, theme }) => {
  return (
    <footer
      className="text-center py-2 footer-custom"
      style={{
        position: 'fixed', // Already sticky
        bottom: 0,
        left: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
        backgroundColor: 'var(--navbar-bg)', // Match the dark background
        boxShadow: '0 -2px 4px var(--shadow-color)',
        zIndex: 1001,
        transition: 'left 0.3s, width 0.3s',
        color: 'var(--text-color)',
      }}
    >
      <p className="mb-0">© 2025 made by OUALID SAAD ACHRAF</p>
    </footer>
  );
};

export default Footer;