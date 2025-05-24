import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Tab, Tabs } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [error, setError] = useState('');

  const initialEmployeeState = {
    nomComplet: '',
    dateNaissance: '',
    sexe: 'Homme',
    grade: '',
    dateRecrutement: '',
    diplome: '',
    affectation: '',
    situationFamiliale: 'Célibataire',
    missionPoste: '',
    formationInitiale: '',
    activitePrincipale: '',
    cin: '',
    ppr: '',
    adresse: '',
    email: '',
    numeroTelephone: '',
    experienceExterne: '',
    experienceInterne: '',
  };

  const [newEmployee, setNewEmployee] = useState(initialEmployeeState);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/employees', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data);
      } catch (error) {
        setError('Failed to fetch employees');
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/employees/${employeeToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(employees.filter((e) => e._id !== employeeToDelete._id));
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (error) {
      setError('Failed to delete employee');
      console.error('Error deleting employee:', error);
    }
  };

  const handleShowModal = (employee = null, mode = 'add') => {
    setModalMode(mode);
    if (employee) {
      setNewEmployee(employee);
      setSelectedEmployeeId(employee._id);
    } else {
      setNewEmployee(initialEmployeeState);
      setSelectedEmployeeId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewEmployee(initialEmployeeState);
  };

  const confirmDelete = (emp) => {
    setEmployeeToDelete(emp);
    setShowDeleteModal(true);
  };

  const handleChange = (e) =>
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (modalMode === 'edit') {
        const response = await axios.put(
          `/api/employees/${selectedEmployeeId}`,
          newEmployee,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees(
          employees.map((e) =>
            e._id === selectedEmployeeId ? response.data : e
          )
        );
      } else {
        const response = await axios.post('/api/employees', newEmployee, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees([...employees, response.data]);
      }
      handleCloseModal();
    } catch (error) {
      setError('Failed to save employee');
      console.error('Error saving employee:', error);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(
      employees.map((emp) => ({
        'Nom Complet': emp.nomComplet,
        'Date Naissance': emp.dateNaissance,
        Sexe: emp.sexe,
        Grade: emp.grade,
        'Date Recrutement': emp.dateRecrutement,
        Diplôme: emp.diplome,
        Affectation: emp.affectation,
        'Situation Familiale': emp.situationFamiliale,
        'Mission Poste': emp.missionPoste,
        CIN: emp.cin,
        PPR: emp.ppr,
        Adresse: emp.adresse,
        Email: emp.email,
        Téléphone: emp.numeroTelephone,
        'Expérience Externe': emp.experienceExterne,
        'Expérience Interne': emp.experienceInterne,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employés');
    XLSX.writeFile(wb, 'employes.xlsx');
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.cin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.ppr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.grade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (id) => navigate(`/employees/${id}`);

  return (
    <div className="container-fluid p-4">
      {error && <p className="text-danger">{error}</p>}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        size="sm"
      >
        <Modal.Body className="text-center p-3">
          <i className="bi bi-exclamation-triangle text-danger fs-4 mb-2" />
          <h6>
            Voulez-vous vraiment supprimer {employeeToDelete?.nomComplet} ?
          </h6>
          <div className="d-flex justify-content-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Annuler
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Confirmer
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <div className="card shadow-sm w-100">
        <div className="card-body px-2">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>
              <i className="bi bi-people me-2" />
              Gestion des Employés
            </h5>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleShowModal(null, 'add')}
              >
                <i className="bi bi-plus-circle me-1" />
                Ajouter
              </Button>
              <Button size="sm" variant="success" onClick={handleExport}>
                <i className="bi bi-file-earmark-excel me-1" />
                Exporter
              </Button>
            </div>
          </div>

          <div className="mb-3" style={{ maxWidth: '400px' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text">
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table
              className="table table-hover"
              style={{ borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}
            >
              <thead className="table-light">
                <tr>
                  {[
                    'Nom Complet',
                    'Date Naiss.',
                    'Sexe',
                    'Grade',
                    'Date Recrut.',
                    'Diplôme',
                    'Affectation',
                    'Situation',
                    'Poste',
                    'CIN',
                    'PPR',
                    'Actions',
                  ].map((col) => (
                    <th
                      key={col}
                      className="fw-semibold px-3"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp._id}
                    onClick={() => handleRowClick(emp._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {[
                      emp.nomComplet,
                      emp.dateNaissance?.substring(0, 10) || 'N/A',
                      emp.sexe,
                      emp.grade,
                      emp.dateRecrutement?.substring(0, 10) || 'N/A',
                      emp.diplome,
                      emp.affectation,
                      emp.situationFamiliale,
                      emp.missionPoste,
                      emp.cin,
                      emp.ppr,
                    ].map((val, idx) => (
                      <td
                        key={idx}
                        className="px-3"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {val || 'N/A'}
                      </td>
                    ))}
                    <td className="px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowModal(emp, 'edit');
                          }}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-secondary p-0 mx-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowModal(emp, 'details');
                          }}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(emp);
                          }}
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0 p-3">
          <Modal.Title className="fs-6 fw-semibold">
            {modalMode === 'add'
              ? 'Nouvel Employé'
              : modalMode === 'edit'
              ? 'Modifier Employé'
              : 'Détails Employé'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-3"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          {modalMode !== 'details' ? (
            <Tabs defaultActiveKey="perso" className="mb-3">
              <Tab eventKey="perso" title="Personnel">
                <div className="row g-3">
                  {[
                    ['Nom Complet', 'nomComplet', 'text'],
                    ['Date Naissance', 'dateNaissance', 'date'],
                    [
                      'Sexe',
                      'sexe',
                      'select',
                      ['Homme', 'Femme'],
                    ],
                    [
                      'Situation Familiale',
                      'situationFamiliale',
                      'select',
                      ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuve'],
                    ],
                    ['Téléphone', 'numeroTelephone', 'tel'],
                    ['Adresse', 'adresse', 'textarea'],
                    ['Email', 'email', 'email'],
                    ['CIN', 'cin', 'text'],
                    ['PPR', 'ppr', 'text'],
                  ].map(([label, name, type, opts]) => (
                    <div className="col-md-6" key={name}>
                      <Form.Label className="small">{label}</Form.Label>
                      {type === 'select' ? (
                        <Form.Select
                          size="sm"
                          name={name}
                          value={newEmployee[name]}
                          onChange={handleChange}
                          disabled={modalMode === 'details'}
                        >
                          <option value="" />
                          {opts.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </Form.Select>
                      ) : type === 'textarea' ? (
                        <Form.Control
                          as="textarea"
                          rows={2}
                          size="sm"
                          name={name}
                          value={newEmployee[name]}
                          onChange={handleChange}
                          readOnly={modalMode === 'details'}
                        />
                      ) : (
                        <Form.Control
                          type={type}
                          size="sm"
                          name={name}
                          value={newEmployee[name]}
                          onChange={handleChange}
                          readOnly={modalMode === 'details'}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Tab>
              <Tab eventKey="pro" title="Professionnel">
                <div className="row g-3">
                  {[
                    ['Grade', 'grade', 'text'],
                    ['Date Recrutement', 'dateRecrutement', 'date'],
                    ['Diplôme', 'diplome', 'text'],
                    ['Affectation', 'affectation', 'text'],
                    ['Mission Poste', 'missionPoste', 'textarea'],
                    ['Formation Initiale', 'formationInitiale', 'text'],
                    ['Activité Principale', 'activitePrincipale', 'text'],
                    ['Expérience Externe', 'experienceExterne', 'textarea'],
                    ['Expérience Interne', 'experienceInterne', 'textarea'],
                  ].map(([label, name, type]) => (
                    <div className="col-md-6" key={name}>
                      <Form.Label className="small">{label}</Form.Label>
                      {type === 'textarea' ? (
                        <Form.Control
                          as="textarea"
                          rows={2}
                          size="sm"
                          name={name}
                          value={newEmployee[name]}
                          onChange={handleChange}
                          readOnly={modalMode === 'details'}
                        />
                      ) : (
                        <Form.Control
                          type={type}
                          size="sm"
                          name={name}
                          value={newEmployee[name]}
                          onChange={handleChange}
                          readOnly={modalMode === 'details'}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Tab>
              <Tab eventKey="contact" title="Contact">
                <div className="row g-3">
                  {[
                    ['Adresse', 'adresse', 'text'],
                    ['Email', 'email', 'email'],
                    ['Téléphone', 'numeroTelephone', 'tel'],
                    ['CIN', 'cin', 'text'],
                    ['PPR', 'ppr', 'text'],
                  ].map(([label, name, type]) => (
                    <div className="col-md-6" key={name}>
                      <Form.Label className="small">{label}</Form.Label>
                      <Form.Control
                        type={type}
                        size="sm"
                        name={name}
                        value={newEmployee[name]}
                        onChange={handleChange}
                        readOnly={modalMode === 'details'}
                      />
                    </div>
                  ))}
                </div>
              </Tab>
              <Tab eventKey="experience" title="Expérience">
                <div className="row g-3">
                  {[
                    ['Expérience Externe', 'experienceExterne'],
                    ['Expérience Interne', 'experienceInterne'],
                    ['Formation Initiale', 'formationInitiale'],
                  ].map(([label, name]) => (
                    <div className="col-12" key={name}>
                      <Form.Label className="small">{label}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        size="sm"
                        name={name}
                        value={newEmployee[name]}
                        onChange={handleChange}
                        readOnly={modalMode === 'details'}
                      />
                    </div>
                  ))}
                </div>
              </Tab>
            </Tabs>
          ) : (
            <div className="row g-3">
              {Object.entries(newEmployee)
                .filter(([k]) => k !== '_id')
                .map(([k, v]) => (
                  <div className="col-md-6" key={k}>
                    <div className="small fw-semibold text-capitalize">
                      {k.replace(/([A-Z])/g, ' $1')}:
                    </div>
                    <div className="small text-muted">{v || '-'}</div>
                  </div>
                ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 p-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCloseModal}
          >
            Fermer
          </Button>
          {modalMode !== 'details' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
            >
              Enregistrer
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeesPage;