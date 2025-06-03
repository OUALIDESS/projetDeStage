import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';
import { BsBell, BsMoon, BsSun, BsX, BsPerson, BsGear, BsBoxArrowRight } from 'react-icons/bs';

const Navbar = ({ collapsed, sidebarWidth, theme, toggleTheme, notifications, notificationCount, markNotificationsAsRead, clearNotifications }) => {
  const [showNotificationCard, setShowNotificationCard] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutCard, setShowLogoutCard] = useState(false);
  const [storedNotifications, setStoredNotifications] = useState([]);
  const navigate = useNavigate();

  // Simplified division mapping (just codes)
  const divisionMap = {
    DAEC: 'DAI',
    DAI: 'DAEC',
    DAS: 'DCT',
    DCT: 'DAS',
    DFL: 'DPE',
    DPE: 'DFL',
    DRHF: 'DUE',
    DUE: 'DRHF',
    Cabinet: 'SG',
    SG: 'Cabinet',
  };

  // Load notifications from localStorage when the component mounts
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const notifications = JSON.parse(savedNotifications);
      const sortedNotifications = notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
      setStoredNotifications(sortedNotifications);
    } else {
      setStoredNotifications([]);
    }
  }, []);

  // Update notifications when new ones come in
  useEffect(() => {
    if (notifications.length > 0) {
      const updatedNotifications = [...notifications.map(notif => ({
        ...notif,
        date: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Algiers' })
      })), ...storedNotifications];
      const sortedNotifications = updatedNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
      setStoredNotifications(sortedNotifications);
      localStorage.setItem('notifications', JSON.stringify(sortedNotifications));
    }
  }, [notifications]);

  // Clear notifications from the UI only (not from localStorage)
  const handleClearNotifications = () => {
    setStoredNotifications([]);
    setShowNotificationCard(false);
    markNotificationsAsRead();
    clearNotifications();
  };

  // Toggle the notification card and mark as read
  const toggleNotificationCard = () => {
    setShowNotificationCard(!showNotificationCard);
    if (!showNotificationCard) {
      // Reload notifications from localStorage when opening the card
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        const notifications = JSON.parse(savedNotifications);
        const sortedNotifications = notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
        setStoredNotifications(sortedNotifications);
      }
      markNotificationsAsRead();
    }
  };

  // Toggle the profile dropdown
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Navigate to settings
  const handleSettingsClick = () => {
    setShowProfileDropdown(false);
    navigate('/pages/Settings');
  };

  // Show logout confirmation
  const handleLogoutClick = () => {
    setShowProfileDropdown(false);
    setShowLogoutCard(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    setShowLogoutCard(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutCard(false);
  };

  // Navigate to settings to see all notifications
  const handleVoirTout = () => {
    setShowNotificationCard(false);
    navigate('/pages/Historique');
  };

  // Format the 'modify' notification
  const formatModifyNotification = (notif) => {
    const changes = Object.entries(notif.data.changes)
      .filter(([_, value]) => String(value.old) !== String(value.new))
      .map(([field, value]) => ({
        field: field === 'divisionId' ? 'Division' : field,
        old: field === 'divisionId' ? divisionMap[value.old] || value.old : value.old,
        new: field === 'divisionId' ? divisionMap[value.new] || value.new : value.new,
      }));

    return (
      <>
        Les informations de l'employé {notif.data.nomComplet} ont été modifiées le{' '}
        <span style={{ fontWeight: 'bold' }}>{notif.date}</span> :
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          {changes.map((change, index) => (
            <li key={index}>
              {change.field === 'Image' ? (
                'Image changer'
              ) : change.field === 'Division' ? (
                `Division : modifiée de ${change.old || 'Inconnue'} à ${change.new || 'Inconnue'}`
              ) : (
                `${change.field} : ${change.old} à ${change.new}`
              )}
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <>
      <nav
        className="d-flex justify-content-between align-items-center px-4 navbar-custom"
        style={{
          position: 'fixed',
          top: 0,
          left: sidebarWidth,
          width: `calc(100% - ${sidebarWidth}px)`,
          height: '60px',
          backgroundColor: 'var(--navbar-bg)',
          boxShadow: '0 2px 4px var(--shadow-color)',
          zIndex: 1001,
          transition: 'left 0.3s, width 0.3s',
          color: 'var(--text-color)',
        }}
      >
        <div />
        <div className="d-flex align-items-center position-relative" style={{ gap: '10px' }}>
          <Button
            variant="link"
            onClick={toggleNotificationCard}
            className="navbar-icon-button position-relative"
            style={{ color: 'var(--text-color)' }}
          >
            <BsBell size={20} style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))' }} />
            {notificationCount > 0 && (
              <span
                className="notification-badge"
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: theme === 'dark' ? '#6b46c1' : '#dc3545',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '800',
                  border: '2px solid var(--card-bg)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                  lineHeight: '1',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              >
                +{notificationCount}
              </span>
            )}
          </Button>

          <Button
            variant="link"
            onClick={toggleProfileDropdown}
            className="navbar-icon-button"
            style={{ color: 'var(--text-color)' }}
          >
            <BsPerson size={20} style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))' }} />
          </Button>

          <Button
            variant="link"
            onClick={toggleTheme}
            className="navbar-icon-button"
            style={{ color: 'var(--text-color)' }}
          >
            {theme === 'light' ? <BsMoon size={20} /> : <BsSun size={20} />}
          </Button>
        </div>
      </nav>

      {showNotificationCard && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '50px',
            width: '300px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px var(--shadow-color)',
            padding: '10px',
            zIndex: 1002,
            color: 'var(--text-color)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6>Notifications</h6>
            <Button variant="link" onClick={handleClearNotifications} style={{ padding: '0', color: 'var(--text-color)' }}>
              <BsX size={16} /> Effacer
            </Button>
          </div>
          {storedNotifications.length === 0 ? (
            <p>Aucune nouvelle notification</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: '0', margin: '0', maxHeight: '200px', overflowY: 'auto' }}>
              {storedNotifications.slice(0, 5).map((notif) => (
                <li key={notif.id} style={{ padding: '5px 0', borderBottom: '1px solid var(--border-color)' }}>
                  {notif.type === 'add' && `Employé ${notif.data.nomComplet} ajouté avec succès`}
                  {notif.type === 'delete' && `Employé ${notif.data.nomComplet} supprimé avec succès`}
                  {notif.type === 'modify' && formatModifyNotification(notif)}
                </li>
              ))}
              {storedNotifications.length > 5 && (
                <Button
                  variant="link"
                  onClick={handleVoirTout}
                  style={{ color: 'var(--text-color)', padding: '5px 15px', width: '100%', textAlign: 'left', textDecoration: 'none' }}
                >
                  Voir tout
                </Button>
              )}
            </ul>
          )}
        </div>
      )}

      {showProfileDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '30px',
            width: '180px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px var(--shadow-color)',
            zIndex: 1002,
            color: 'var(--text-color)',
          }}
        >
          <ul style={{ listStyle: 'none', padding: '5px 0', margin: '0' }}>
            <li>
              <Button
                variant="link"
                onClick={handleSettingsClick}
                style={{
                  color: 'var(--text-color)',
                  padding: '5px 15px',
                  width: '100%',
                  textAlign: 'left',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
                className="profile-menu-item"
              >
                <BsGear size={16} style={{ marginRight: '8px' }} /> Paramètres
              </Button>
            </li>
            <li>
              <Button
                variant="link"
                onClick={handleLogoutClick}
                style={{
                  color: 'var(--text-color)',
                  padding: '5px 15px',
                  width: '100%',
                  textAlign: 'left',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
                className="profile-menu-item"
              >
                <BsBoxArrowRight size={16} style={{ marginRight: '8px' }} /> Se déconnecter
              </Button>
            </li>
          </ul>
        </div>
      )}

      {showLogoutCard && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1050,
          }}
        >
          <Card
            className="position-absolute top-50 start-50 translate-middle"
            style={{
              width: '20rem',
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              boxShadow: '0 4px 6px var(--shadow-color)',
              color: 'var(--text-color)',
            }}
          >
            <Card.Body>
              <Card.Title>Confirmer la Déconnexion</Card.Title>
              <Card.Text>Êtes-vous sûr de vouloir vous déconnecter ?</Card.Text>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <Button
                  variant="danger"
                  onClick={confirmLogout}
                  style={{ width: '80px', backgroundColor: '#dc3545', borderColor: '#dc3545', color: '#ffffff' }}
                >
                  Oui
                </Button>
                <Button
                  variant="outline-light"
                  onClick={cancelLogout}
                  style={{
                    width: '80px',
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  Non
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      <style>
        {`
          .navbar-icon-button {
            padding: 6px;
            border-radius: 50%;
            transition: background-color 0.2s ease, transform 0.1s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .navbar-icon-button:hover {
            background-color: var(--secondary-bg);
            transform: scale(1.1);
          }

          .navbar-icon-button:active {
            transform: scale(0.95);
          }

          .notification-badge {
            transition: transform 0.2s ease, background-color 0.2s ease;
          }

          .navbar-icon-button:hover .notification-badge {
            transform: scale(1.15);
            background-color: ${theme === 'dark' ? '#8b5cf6' : '#c82333'};
          }

          .profile-menu-item:hover {
            background-color: var(--secondary-bg);
          }

          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); }
            50% { transform: scale(1.05); box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4); }
            100% { transform: scale(1); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); }
          }
        `}
      </style>
    </>
  );
};

export default Navbar;