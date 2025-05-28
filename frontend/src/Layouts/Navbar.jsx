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

  // Load notifications from localStorage on component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setStoredNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Update localStorage whenever notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      const updatedNotifications = [...storedNotifications, ...notifications];
      setStoredNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    }
  }, [notifications]);

  // Clear notifications and localStorage
  const handleClearNotifications = () => {
    clearNotifications();
    setStoredNotifications([]);
    localStorage.removeItem('notifications');
  };

  const toggleNotificationCard = () => {
    setShowNotificationCard(!showNotificationCard);
    if (!showNotificationCard) {
      markNotificationsAsRead();
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleSettingsClick = () => {
    setShowProfileDropdown(false);
    navigate('/pages/Settings');
  };

  const handleLogoutClick = () => {
    setShowProfileDropdown(false);
    setShowLogoutCard(true);
  };

  const confirmLogout = () => {
    setShowLogoutCard(false);
    navigate('/pages/Login');
  };

  const cancelLogout = () => {
    setShowLogoutCard(false);
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
            className="navbar-icon-button"
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
                  backgroundColor: '#6b46c1',
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
              {storedNotifications.map((notif) => (
                <li key={notif.id} style={{ padding: '5px 0', borderBottom: '1px solid var(--border-color)' }}>
                  {notif.type === 'add' && `Employé ${notif.data.nomComplet} ajouté avec succès`}
                  {notif.type === 'delete' && `Employé ${notif.data.nomComplet} supprimé avec succès`}
                  {notif.type === 'modify' && (
                    <span>
                      Employé {notif.data.nomComplet}, ses infos seront modifiées :{' '}
                      {Object.keys(notif.data.changes).map((field, index) => (
                        <span key={field}>
                          {field === 'divisionId' && `Division modifiée de '${notif.data.changes[field].old}' à '${notif.data.changes[field].new}'`}
                          {field !== 'divisionId' && notif.data.changes[field].old !== notif.data.changes[field].new && (
                            `${field === 'sexe' ? 'Genre' : field.charAt(0).toUpperCase() + field.slice(1)} modifié de '${notif.data.changes[field].old}' à '${notif.data.changes[field].new}'`
                          )}
                          {index < Object.keys(notif.data.changes).length - 1 && ', '}
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              ))}
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
                  style={{ width: '80px', backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'var(--text-color)' }}
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
            background-color: ${theme === 'dark' ? 'rgba(107, 70, 193, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
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
            background-color: #8b5cf6;
          }

          .profile-menu-item:hover {
            background-color: ${theme === 'dark' ? 'rgba(107, 70, 193, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }
          }
        `}
      </style>
    </>
  );
};

export default Navbar;