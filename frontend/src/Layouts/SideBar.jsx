import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import {
  BsColumnsGap,
  BsPeople,
  BsPersonCheck,
  BsBarChartLine,
  BsGrid,
  BsClockHistory,
  BsBoxArrowRight,
  BsChevronDown,
  BsChevronUp,
  BsList,
  BsX,
  BsPlus,
  BsTrash,
  BsPencilSquare,
} from 'react-icons/bs';

const Sidebar = ({ collapsed, onToggle, theme }) => {
  const [divOpen, setDivOpen] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Aucun jeton disponible');
      const response = await axios.get('http://localhost:5000/api/divisions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDivisions(response.data);
    } catch (err) {
      console.error('Erreur de récupération des divisions:', err.response?.data || err);
      setError('Échec de la récupération des divisions: ' + (err.response?.data?.data?.message || err.message));
    }
  };

  const handleAddDivision = async () => {
    if (!newDivisionName) {
      setError('Nom de la division requis');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Aucun jeton disponible');
      await axios.post('http://localhost:5000/api/divisions', { name: newDivisionName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewDivisionName('');
      setShowAddModal(false);
      setError('');
      fetchDivisions();
    } catch (err) {
      console.error('Erreur d\'ajout de division:', err.response?.data || err);
      setError('Échec de l\'ajout de la division: ' + (err.response?.data?.data?.message || err.message));
    }
  };

  const handleDeleteDivision = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette division ?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Aucun jeton disponible');
        await axios.delete(`http://localhost:5000/api/divisions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setError('');
        fetchDivisions();
      } catch (err) {
        console.error('Erreur de suppression de division:', err.response?.data || err);
        setError('Échec de la suppression de la division: ' + (err.response?.data?.data?.message || err.message));
      }
    }
  };

  const IconWrapper = ({ children }) => (
    <div style={{ width: '22px', height: '22px', minWidth: '22px' }} className="d-flex justify-content-center align-items-center">
      {children}
    </div>
  );

  const linkClass = ({ isActive }) => {
    const base = isActive ? 'fw-bold' : 'fw-normal';
    return `d-flex align-items-center ${base} rounded mb-3 nav-hover` +
      (collapsed ? ' justify-content-center py-1 px-0' : ' px-2 py-1');
  };

  // Updated known divisions to include all 10 divisions
  const knownDivisions = [
    { _id: 'cabinet', name: 'Cabinet', isStatic: true, path: '/pages/divisions/Cabinet' },
    { _id: 'sg', name: 'SG', isStatic: true, path: '/pages/divisions/SG' },
    { _id: 'daec', name: 'DAEC', path: '/pages/divisions/DAEC' },
    { _id: 'dai', name: 'DAI', path: '/pages/divisions/DAI' },
    { _id: 'das', name: 'DAS', path: '/pages/divisions/DAS' },
    { _id: 'dct', name: 'DCT', path: '/pages/divisions/DCT' },
    { _id: 'dfl', name: 'DFL', path: '/pages/divisions/DFL' },
    { _id: 'dpe', name: 'DPE', path: '/pages/divisions/DPE' },
    { _id: 'drhf', name: 'DRHF', path: '/pages/divisions/DRHF' },
    { _id: 'due', name: 'DUE', path: '/pages/divisions/DUE' },
  ];

  // Filter and merge API divisions with known divisions
  const allDivisions = divisions
    .filter(div => knownDivisions.some(kd => kd.name === div.name))
    .map(div => ({
      ...div,
      path: knownDivisions.find(kd => kd.name === div.name).path,
      isStatic: knownDivisions.find(kd => kd.name === div.name).isStatic || false,
    }))
    .concat(knownDivisions.filter(kd => kd.isStatic && !divisions.some(div => div.name === kd.name)))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <nav
      className="d-flex flex-column sidebar-custom"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: `${collapsed ? 50 : 200}px`,
        backgroundColor: 'var(--background-color)',
        boxShadow: '2px 0 8px var(--shadow-color)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        zIndex: 1000,
        color: 'var(--text-color)',
      }}
    >
      <style>
        {`
          ::-webkit-scrollbar { display: none; }
          nav a, .menu-button {
            text-decoration: none !important;
            font-size: 0.95rem;
            transition: background-color 0.2s ease;
            color: var(--text-color) !important;
          }
          .nav-hover:hover {
            background-color: ${theme === 'dark' ? 'rgba(107, 70, 193, 0.2)' : 'rgba(0, 0, 0, 0.05)'} !important;
          }
          button.btn:hover {
            background-color: ${theme === 'dark' ? 'rgba(107, 70, 193, 0.2)' : 'rgba(0, 0, 0, 0.05)'} !important;
            color: var(--text-color) !important;
          }
          button.btn {
            color: var(--text-color) !important;
            font-weight: 400 !important;
            background-color: transparent !important;
          }
        `}
      </style>

      <div className="flex-shrink-0 p-1 position-sticky top-0" style={{ backgroundColor: 'var(--background-color)', zIndex: 2, marginBottom: '1rem' }}>
        <button
          className="btn p-1 bg-transparent border-0"
          onClick={onToggle}
          style={{ color: 'var(--text-color)' }}
        >
          <IconWrapper>{collapsed ? <BsList size={20} /> : <BsX size={20} />}</IconWrapper>
        </button>
      </div>

      <div className="flex-grow-1 overflow-auto p-1" style={{ paddingBottom: '3rem' }}>
        {error && <Alert variant="danger" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</Alert>}
        <NavLink to="/pages/Dashboard" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsColumnsGap size={20} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Tableau de bord</span>}
            </>
          )}
        </NavLink>

        <NavLink to="/pages/Employees" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsPeople size={20} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Employés</span>}
            </>
          )}
        </NavLink>

        <NavLink to="/pages/ChefDivisions" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsPersonCheck size={20} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Chefs des divisions</span>}
            </>
          )}
        </NavLink>

        <NavLink to="/pages/GradeEmployes" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsBarChartLine size={20} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Grade des employés</span>}
            </>
          )}
        </NavLink>

        <button
          className={`btn w-100 rounded mb-3 text-start d-flex align-items-center menu-button`}
          onClick={() => setDivOpen(!divOpen)}
          style={{ backgroundColor: 'transparent' }}
        >
          <IconWrapper><BsGrid size={20} style={{ color: 'var(--text-color)' }} /></IconWrapper>
          {!collapsed && <span className="ms-2 flex-grow-1">Divisions</span>}
          {!collapsed && (divOpen ? <BsChevronUp size={14} style={{ color: 'var(--text-color)' }} /> : <BsChevronDown size={14} style={{ color: 'var(--text-color)' }} />)}
        </button>
        {divOpen && !collapsed && (
          <div className="ms-3 mb-1">
            {allDivisions.map((division) => (
              <div key={division._id} className="d-flex align-items-center mb-2">
                <NavLink
                  to={division.path}
                  className={linkClass}
                  style={{ fontSize: '0.9rem', padding: '0.2rem 0.8rem' }}
                >
                  {division.name}
                </NavLink>
                {!division.isStatic && !division.isSeeded && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-1 p-1"
                    onClick={() => handleDeleteDivision(division._id)}
                    style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'var(--text-color)' }}
                  >
                    <BsTrash size={14} />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="primary"
              size="sm"
              className="mt-3 w-100"
              onClick={() => setShowAddModal(true)}
              style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'var(--text-color)', fontSize: '0.9rem' }}
            >
              <BsPlus size={14} /> Ajouter une division
            </Button>
          </div>
        )}

        <NavLink to="/pages/Note" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsPencilSquare size={20} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Notes</span>}
            </>
          )}
        </NavLink>
      </div>

      <div className="flex-shrink-0 px-2 py-1">
        <NavLink to="/pages/Historique" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsClockHistory size={20} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Historique</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/pages/Logout" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsBoxArrowRight size={20} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Se déconnecter</span>}
            </>
          )}
        </NavLink>
      </div>

      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); setError(''); }} centered>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
          <Modal.Title style={{ fontSize: '1.15rem' }}>Ajouter une nouvelle division</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
          {error && <Alert variant="danger" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', fontSize: '0.9rem' }}>{error}</Alert>}
          <Form onSubmit={(e) => { e.preventDefault(); handleAddDivision(); }}>
            <Form.Group className="mb-2">
              <Form.Label style={{ fontSize: '1rem' }}>Nom de la division</Form.Label>
              <Form.Control
                type="text"
                value={newDivisionName}
                onChange={(e) => setNewDivisionName(e.target.value)}
                placeholder="Entrez le nom de la division"
                required
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)', fontSize: '1rem' }}
              />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'var(--text-color)', fontSize: '1rem' }}>
              Ajouter
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </nav>
  );
};

export default Sidebar;