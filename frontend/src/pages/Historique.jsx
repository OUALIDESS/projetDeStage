import React, { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';

function Settings({ theme, clearNotifications }) {
  const [allNotifications, setAllNotifications] = useState([]);
  const [showClearWarning, setShowClearWarning] = useState(false);

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

  // Field names translated to French
  const fieldNames = {
    nomComplet: 'Nom Complet',
    divisionId: 'Division',
    image: 'Image',
  };

  // Load all notifications from localStorage when the component mounts
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const notifications = JSON.parse(savedNotifications);
      // Sort notifications by date, most recent first
      const sortedNotifications = notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllNotifications(sortedNotifications);
    } else {
      setAllNotifications([]);
    }
  }, []);

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

  // Handle clearing all notifications
  const handleClearNotifications = () => {
    setShowClearWarning(true);
  };

  // Confirm clearing notifications
  const confirmClearNotifications = () => {
    localStorage.removeItem('notifications');
    setAllNotifications([]);
    setShowClearWarning(false);
    // Notify Navbar to clear notifications
    if (clearNotifications) {
      clearNotifications();
    }
  };

  // Cancel clearing notifications
  const cancelClearNotifications = () => {
    setShowClearWarning(false);
  };

  return (
    <div style={{ padding: '20px', color: 'var(--text-color)', backgroundColor: 'var(--card-bg)' }}>
      <h2>Paramètres</h2>
      <h3>Historique des Modifications</h3>
      <Button
        variant="outline-danger"
        onClick={handleClearNotifications}
        disabled={allNotifications.length === 0}
        style={{ marginBottom: '15px', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
      >
        Effacer
      </Button>
      {allNotifications.length === 0 ? (
        <p>Aucune modification enregistrée.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: '0', margin: '0', maxHeight: '70vh', overflowY: 'auto' }}>
          {allNotifications.map((notif) => (
            <li key={notif.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              {notif.type === 'add' && `Employé ${notif.data.nomComplet} ajouté avec succès le ${notif.date}`}
              {notif.type === 'delete' && `Employé ${notif.data.nomComplet} supprimé avec succès le ${notif.date}`}
              {notif.type === 'modify' && formatModifyNotification(notif)}
            </li>
          ))}
        </ul>
      )}

      {showClearWarning && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1050,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Card
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
              <Card.Title>Avertissement</Card.Title>
              <Card.Text>Êtes-vous sûr de vouloir effacer tout l'historique des modifications ? Cette action est irréversible.</Card.Text>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <Button
                  variant="danger"
                  onClick={confirmClearNotifications}
                  style={{ width: '80px', backgroundColor: '#dc3545', borderColor: '#dc3545', color: '#ffffff' }}
                >
                  Oui
                </Button>
                <Button
                  variant="outline-light"
                  onClick={cancelClearNotifications}
                  style={{ width: '80px', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
                >
                  Non
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Settings;