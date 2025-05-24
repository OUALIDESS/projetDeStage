import React, { useState, useEffect } from 'react';
import { 
  BsPlus, BsDownload, BsSearch, BsArrowDown, BsArrowUp, BsEye, BsPencil, BsTrash, BsExclamationTriangle
} from 'react-icons/bs';
import { Button, Form, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';

const DUE = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState('');

  const [newEmployee, setNewEmployee] = useState({ 
    nomComplet: '', grade: '', missionPoste: '', email: ''
  });

  useEffect(() => {
    const fetchDUEEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to access this page');
          navigate('/login');
          return;
        }

        const divisionRes = await axios.get('/api/divisions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const due = divisionRes.data.find(d => d.name === 'DUE');
        if (!due) {
          setError('DUE division not found');
          return;
        }

        const employeeRes = await axios.get('/api/employees', {
          headers: { Authorization: `Bearer ${token}` },
          params: { ids: due.employeeIds.join(',') }
        });
        setEmployees(employeeRes.data);
      } catch (err) {
        setError('Failed to fetch employees');
        console.error('Error fetching DUE employees:', err);
      }
    };
    fetchDUEEmployees();
  }, [navigate]);

  const filtered = employees.filter(emp =>
    emp.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.missionPoste?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) =>
    sortAsc ? a.nomComplet.localeCompare(b.nomComplet) : b.nomComplet.localeCompare(a.nomComplet)
  );

  const totalMissions = sorted.length;

  const toggleSort = () => setSortAsc(prev => !prev);

  const handleSaveEmployee = async () => {
    try {
      const token = localStorage.getItem('token');
      let updatedEmployee = editMode ? { ...currentEmployee } : { ...newEmployee };

      if (!updatedEmployee.nomComplet || !updatedEmployee.email) {
        setError('Name and email are required');
        return;
      }

      if (editMode) {
        const response = await axios.put(`/api/employees/${currentEmployee._id}`, updatedEmployee, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(employees.map(emp => emp._id === currentEmployee._id ? response.data : emp));
      } else {
        const response = await axios.post('/api/employees', updatedEmployee, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const divisionRes = await axios.get('/api/divisions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const due = divisionRes.data.find(d => d.name === 'DUE');
        if (due) {
          await axios.put(`/api/divisions/${due._id}`, {
            ...due,
            employeeIds: [...due.employeeIds, response.data._id]
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        setEmployees([...employees, response.data]);
      }
      setShowModal(false);
      setNewEmployee({ nomComplet: '', grade: '', missionPoste: '', email: '' });
      setCurrentEmployee(null);
      setEditMode(false);
      setError('');
    } catch (err) {
      setError('Failed to save employee');
      console.error('Error saving employee:', err);
    }
  };

  const handleEdit = emp => {
    setCurrentEmployee(emp);
    setEditMode(true);
    setShowModal(true);
  };

  const handleViewDetails = emp => {
    setSelectedEmployee(emp);
    setShowDetailsModal(true);
  };

  const handleDeleteConfirm = emp => {
    setEmployeeToDelete(emp);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/employees/${employeeToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const divisionRes = await axios.get('/api/divisions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const due = divisionRes.data.find(d => d.name === 'DUE');
      if (due) {
        await axios.put(`/api/divisions/${due._id}`, {
          ...due,
          employeeIds: due.employeeIds.filter(id => id !== employeeToDelete._id)
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setEmployees(employees.filter(e => e._id !== employeeToDelete._id));
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (err) {
      setError('Failed to delete employee');
      console.error('Error deleting employee:', err);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(sorted.map(emp => ({
      'Nom de l\'employé': emp.nomComplet,
      'Poste': emp.grade,
      'Mission': emp.missionPoste
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employés DUE');
    XLSX.writeFile(wb, 'employes_due.xlsx');
  };

  const handleRowClick = (id) => {
    navigate(`/employee/${id}`);
  };

  return (
    <div className="bg-white rounded-3 shadow-sm p-4 mx-auto" style={{ maxWidth: '1200px', margin: '20px' }}>
      {error && <p className="text-danger">{error}</p>}
      <div className="text-end mb-3">
        <span className="fw-semibold">Total des missions : {totalMissions}</span>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0 fw-semibold">Gestion des missions - DUE</h5>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={handleExport}>
            <BsDownload size={18} /> Exporter
          </Button>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <BsPlus size={20} /> Ajouter mission
          </Button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <InputGroup style={{ maxWidth: '400px' }}>
          <InputGroup.Text style={{ padding: '0.2rem 0.4rem', background: 'transparent', borderRight: 'none', boxShadow: 'none' }}>
            <BsSearch size={18} />
          </InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Rechercher par nom ou mission"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ height: '30px', padding: '0.2rem 0.4rem', borderColor: '#ccc', boxShadow: 'none' }}
            onFocus={e => e.target.style.boxShadow = 'none'}
          />
        </InputGroup>
        <Button
          variant="outline-secondary"
          onClick={toggleSort}
          className="d-flex align-items-center gap-2"
          style={{ height: '36px', padding: '0 12px' }}
          aria-label={sortAsc ? 'Trier de Z→A' : 'Trier de A→Z'}
        >
          <span className="me-1">Trier</span>
          {sortAsc ? <BsArrowDown size={18} /> : <BsArrowUp size={18} />}
        </Button>
      </div>

      <table className="table table-hover mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: '30%' }}>Nom de l'employé</th>
            <th style={{ width: '30%' }}>Poste</th>
            <th style={{ width: '35%' }}>Mission</th>
            <th style={{ width: '5%' }} className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(emp => (
            <tr key={emp._id} onClick={() => handleRowClick(emp._id)} style={{ cursor: 'pointer' }}>
              <td>{emp.nomComplet}</td>
              <td>{emp.grade}</td>
              <td>{emp.missionPoste || 'N/A'}</td>
              <td className="text-center" onClick={e => e.stopPropagation()}>
                <div className="d-flex justify-content-center gap-2">
                  <Button 
                    variant="link" 
                    className="p-0 text-primary" 
                    onClick={() => handleEdit(emp)}
                    style={{ boxShadow: 'none' }}
                  >
                    <BsPencil size={18} />
                  </Button>
                  <Button 
                    variant="link" 
                    className="p-0 text-secondary" 
                    onClick={() => handleViewDetails(emp)}
                    style={{ boxShadow: 'none' }}
                  >
                    <BsEye size={18} />
                  </Button>
                  <Button 
                    variant="link" 
                    className="p-0 text-danger" 
                    onClick={() => handleDeleteConfirm(emp)}
                    style={{ boxShadow: 'none' }}
                  >
                    <BsTrash size={18} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={() => { setShowModal(false); setEditMode(false); setError(''); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Modifier la mission' : 'Ajouter une nouvelle mission'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l'employé</Form.Label>
              <Form.Control
                value={editMode ? currentEmployee?.nomComplet : newEmployee.nomComplet}
                onChange={e => editMode
                  ? setCurrentEmployee({ ...currentEmployee, nomComplet: e.target.value })
                  : setNewEmployee({ ...newEmployee, nomComplet: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editMode ? currentEmployee?.email : newEmployee.email}
                onChange={e => editMode
                  ? setCurrentEmployee({ ...currentEmployee, email: e.target.value })
                  : setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Poste</Form.Label>
              <Form.Control
                value={editMode ? currentEmployee?.grade : newEmployee.grade}
                onChange={e => editMode
                  ? setCurrentEmployee({ ...currentEmployee, grade: e.target.value })
                  : setNewEmployee({ ...newEmployee, grade: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mission</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editMode ? currentEmployee?.missionPoste : newEmployee.missionPoste}
                onChange={e => editMode
                  ? setCurrentEmployee({ ...currentEmployee, missionPoste: e.target.value })
                  : setNewEmployee({ ...newEmployee, missionPoste: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); setEditMode(false); setError(''); }}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveEmployee}>
            {editMode ? 'Enregistrer les modifications' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Détails de l'employé</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <div className="d-flex flex-column gap-3">
              <div><strong>Nom complet :</strong> {selectedEmployee.nomComplet}</div>
              <div><strong>Poste :</strong> {selectedEmployee.grade}</div>
              <div><strong>Mission assignée :</strong> {selectedEmployee.missionPoste || 'N/A'}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Fermer</Button>
          <Button variant="primary" onClick={() => navigate(`/employee/${selectedEmployee?._id}`)}>
            Voir Fiche de Poste
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        size="md"
      >
        <Modal.Body className="text-center py-4">
          <BsExclamationTriangle size={40} className="text-danger mb-3" />
          <p className="mb-4 fs-5 fw-bold">
            Vous voulez vraiment supprimer {employeeToDelete?.nomComplet || 'cet élément'} ?
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Confirmer
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DUE;