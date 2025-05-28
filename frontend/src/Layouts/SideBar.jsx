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
  BsGear,
  BsBoxArrowRight,
  BsChevronDown,
  BsChevronUp,
  BsList,
  BsX,
  BsPlus,
  BsTrash,
} from 'react-icons/bs';

const Sidebar = ({ collapsed, onToggle, theme, toggleTheme }) => {
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
      const response = await axios.get('http://localhost:5000/api/divisions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDivisions(response.data);
    } catch (err) {
      console.error('Fetch divisions error:', err.response?.data || err);
      setError('Failed to fetch divisions: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddDivision = async () => {
    if (!newDivisionName) {
      setError('Division name is required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/divisions', { name: newDivisionName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewDivisionName('');
      setShowAddModal(false);
      setError('');
      fetchDivisions();
    } catch (err) {
      console.error('Add division error:', err.response?.data || err);
      setError('Failed to add division: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteDivision = async (id) => {
    if (window.confirm('Are you sure you want to delete this division?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/divisions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setError('');
        fetchDivisions();
      } catch (err) {
        console.error('Delete division error:', err.response?.data || err);
        setError('Failed to delete division: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const IconWrapper = ({ children }) => (
    <div style={{ width: '20px', height: '20px', minWidth: '20px' }} className="d-flex justify-content-center align-items-center">
      {children}
    </div>
  );

  const linkClass = ({ isActive }) => {
    const base = 'fw-normal';
    return `d-flex align-items-center ${base} rounded mb-2 nav-hover` +
      (collapsed ? ' justify-content-center py-2 px-0' : ' px-3 py-2');
  };

  return (
    <nav
      className="d-flex flex-column sidebar-custom"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: `${collapsed ? 60 : 240}px`,
        backgroundColor: 'var(--background-color)', // #14131f
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
            font-size: 0.85rem;
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

      <div className="flex-shrink-0 p-2 position-sticky top-0" style={{ backgroundColor: 'var(--background-color)', zIndex: 2 }}>
        <button
          className="btn p-2 bg-transparent border-0"
          onClick={onToggle}
          style={{ color: 'var(--text-color)' }}
        >
          <IconWrapper>{collapsed ? <BsList size={18} /> : <BsX size={18} />}</IconWrapper>
        </button>
        {!collapsed && <h6 className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>PROJECT</h6>}
      </div>

      <div className="flex-grow-1 overflow-auto p-2" style={{ paddingBottom: '4rem' }}>
        {error && <Alert variant="danger" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>{error}</Alert>}
        <NavLink to="/pages/Dashboard" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsColumnsGap size={18} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Tableau de bord</span>}
            </>
          )}
        </NavLink>

        <NavLink to="/pages/Employees" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsPeople size={18} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Employés</span>}
            </>
          )}
        </NavLink>

        <NavLink to="/pages/ChefDivisions" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsPersonCheck size={18} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Chefs des divisions</span>}
            </>
          )}
        </NavLink>

        <NavLink to="/pages/GradeEmployes" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsBarChartLine size={18} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Grade des employés</span>}
            </>
          )}
        </NavLink>

        <button
          className={`btn w-100 rounded mb-2 text-start d-flex align-items-center menu-button`}
          onClick={() => setDivOpen(!divOpen)}
          style={{ backgroundColor: 'transparent' }}
        >
          <IconWrapper><BsGrid size={18} style={{ color: 'var(--text-color)' }} /></IconWrapper>
          {!collapsed && <span className="ms-2 flex-grow-1">Divisions</span>}
          {!collapsed && (divOpen ? <BsChevronUp size={12} style={{ color: 'var(--text-color)' }} /> : <BsChevronDown size={12} style={{ color: 'var(--text-color)' }} />)}
        </button>
        {divOpen && !collapsed && (
          <div className="ms-4 mb-2">
            {divisions.map((division) => (
              <div key={division._id} className="d-flex align-items-center mb-1">
                <NavLink
                  to={`/pages/divisions/${division.name}`}
                  className={linkClass}
                  style={{ fontSize: '0.8rem', padding: '0.25rem 1rem' }}
                >
                  {division.name}
                </NavLink>
                {!division.isSeeded && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2 p-1"
                    onClick={() => handleDeleteDivision(division._id)}
                    style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'var(--text-color)' }}
                  >
                    <BsTrash size={12} />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="primary"
              size="sm"
              className="mt-2 w-100"
              onClick={() => setShowAddModal(true)}
              style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'var(--text-color)' }}
            >
              <BsPlus size={12} /> Add Division
            </Button>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-3 py-2">
        <NavLink to="/pages/Settings" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsGear size={18} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Paramètres</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/pages/Logout" className={linkClass}>
          {() => (
            <>
              <IconWrapper><BsBoxArrowRight size={18} style={{ color: 'var(--text-color)' }} /></IconWrapper>
              {!collapsed && <span className="ms-2">Se déconnecter</span>}
            </>
          )}
        </NavLink>
      </div>

      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); setError(''); }} centered>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
          <Modal.Title>Add New Division</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
          {error && <Alert variant="danger" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>{error}</Alert>}
          <Form onSubmit={(e) => { e.preventDefault(); handleAddDivision(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Division Name</Form.Label>
              <Form.Control
                type="text"
                value={newDivisionName}
                onChange={(e) => setNewDivisionName(e.target.value)}
                placeholder="Enter division name"
                required
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
              />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'var(--text-color)' }}>
              Add
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </nav>
  );
};

export default Sidebar;