// Footer.jsx
import React from 'react';

const footerColor = '#ffffff';

export default function Footer({ collapsed, sidebarWidth }) {
  return (
    <footer
      className="text-center py-2"
      style={{
        position: 'fixed',
        bottom: 0,
        left: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
        backgroundColor: footerColor,
        zIndex: 1001,
        transition: 'left 0.3s, width 0.3s'
        // pas de borderTop
      }}
    >
      <p className="mb-0">© 2025 made by OUALID SAAD ACHRAF</p>
    </footer>
  );
}
