import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [formData, setFormData] = useState({
    nomComplet: '',
    dateNaissance: '',
    sexe: '',
    grade: '',
    dateRecrutement: '',
    diplome: '',
    affectation: '',
    situationFamiliale: '',
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
    typeContrat: '',
    divisionId: '',
    supplementaryInfo: [],
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
    fetchDivisions();
    fetchEmployees();
  }, [navigate]);

  const fetchDivisions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/divisions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched divisions:', response.data);
      setDivisions(response.data);
    } catch (err) {
      setError('Failed to fetch divisions: ' + (err.response?.data?.message || err.message));
      console.error('Fetch divisions error:', err.response?.data || err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched employees:', response.data);
      setEmployees(response.data);
    } catch (err) {
      setError('Failed to fetch employees: ' + (err.response?.data?.message || err.message));
      console.error('Fetch employees error:', err.response?.data || err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (employee = null) => {
    console.log('Opening modal for employee:', employee);
    setCurrentEmployee(employee);
    setFormData(
      employee
        ? {
            nomComplet: employee.nomComplet || '',
            dateNaissance: employee.dateNaissance || '',
            sexe: employee.sexe || '',
            grade: employee.grade || '',
            dateRecrutement: employee.dateRecrutement || '',
            diplome: employee.diplome || '',
            affectation: employee.affectation || '',
            situationFamiliale: employee.situationFamiliale || '',
            missionPoste: employee.missionPoste || '',
            formationInitiale: employee.formationInitiale || '',
            activitePrincipale: employee.activitePrincipale || '',
            cin: employee.cin || '',
            ppr: employee.ppr || '',
            adresse: employee.adresse || '',
            email: employee.email || '',
            numeroTelephone: employee.numeroTelephone || '',
            experienceExterne: employee.experienceExterne || '',
            experienceInterne: employee.experienceInterne || '',
            typeContrat: employee.typeContrat || '',
            divisionId: employee.divisionId?._id || '',
            supplementaryInfo: employee.supplementaryInfo || [],
          }
        : {
            nomComplet: '',
            dateNaissance: '',
            sexe: '',
            grade: '',
            dateRecrutement: '',
            diplome: '',
            affectation: '',
            situationFamiliale: '',
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
            typeContrat: '',
            divisionId: '',
            supplementaryInfo: [],
          }
    );
    setShowModal(true);
  };

  const handleViewDetails = (employee) => {
    console.log('Viewing details for employee:', employee);
    setCurrentEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nomComplet) {
      setError('Full Name is required');
      return;
    }
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    if (!formData.divisionId) {
      setError('Division is required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      console.log('Sending request with payload:', formData);
      if (currentEmployee) {
        const response = await axios.put(
          `http://localhost:5000/api/employees/${currentEmployee._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Update response:', response.data);
      } else {
        const response = await axios.post('http://localhost:5000/api/employees', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Create response:', response.data);
      }
      setShowModal(false);
      setError('');
      fetchEmployees();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err);
      setError('Failed to ' + (currentEmployee ? 'update' : 'create') + ' employee: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('token');
        console.log('Deleting employee with ID:', id);
        const response = await axios.delete(`http://localhost:5000/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Delete response:', response.data);
        fetchEmployees();
      } catch (err) {
        console.error('Delete error:', err.response?.data || err);
        setError('Failed to delete employee: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Employee Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="primary" className="mb-3" onClick={() => openModal()}>
        Add Employee
      </Button>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Grade</th>
            <th>Mission</th>
            <th>Division</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td>{employee.nomComplet || 'N/A'}</td>
              <td>{employee.grade || 'N/A'}</td>
              <td>{employee.missionPoste || 'N/A'}</td>
              <td>{employee.divisionId?.name || 'Unknown'}</td>
              <td>
                <Button
                  variant="info"
                  className="me-2"
                  onClick={(e) => { e.stopPropagation(); handleViewDetails(employee); }}
                >
                  Voir Details
                </Button>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={(e) => { e.stopPropagation(); openModal(employee); }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={(e) => handleDelete(e, employee._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentEmployee ? 'Edit Employee' : 'Add Employee'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="nomComplet"
                    value={formData.nomComplet}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Grade</Form.Label>
                  <Form.Control
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Hire Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateRecrutement"
                    value={formData.dateRecrutement}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Diploma</Form.Label>
                  <Form.Control
                    type="text"
                    name="diplome"
                    value={formData.diplome}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Affectation</Form.Label>
                  <Form.Control
                    type="text"
                    name="affectation"
                    value={formData.affectation}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Marital Status</Form.Label>
                  <Form.Select
                    name="situationFamiliale"
                    value={formData.situationFamiliale}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Status</option>
                    <option value="Célibataire">Célibataire</option>
                    <option value="Marié">Marié</option>
                    <option value="Divorcé">Divorcé</option>
                    <option value="Veuf">Veuf</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mission</Form.Label>
                  <Form.Control
                    type="text"
                    name="missionPoste"
                    value={formData.missionPoste}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Division</Form.Label>
                  <Form.Select
                    name="divisionId"
                    value={formData.divisionId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Division</option>
                    {divisions.map((division) => (
                      <option key={division._id} value={division._id}>
                        {division.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Initial Training</Form.Label>
                  <Form.Control
                    type="text"
                    name="formationInitiale"
                    value={formData.formationInitiale}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Main Activity</Form.Label>
                  <Form.Control
                    type="text"
                    name="activitePrincipale"
                    value={formData.activitePrincipale}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>CIN</Form.Label>
                  <Form.Control
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>PPR</Form.Label>
                  <Form.Control
                    type="text"
                    name="ppr"
                    value={formData.ppr}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="numeroTelephone"
                    value={formData.numeroTelephone}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>External Experience</Form.Label>
                  <Form.Control
                    type="text"
                    name="experienceExterne"
                    value={formData.experienceExterne}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Internal Experience</Form.Label>
                  <Form.Control
                    type="text"
                    name="experienceInterne"
                    value={formData.experienceInterne}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contract Type</Form.Label>
                  <Form.Control
                    type="text"
                    name="typeContrat"
                    value={formData.typeContrat}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </div>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentEmployee && (
            <div className="row">
              <div className="col-md-6">
                <p><strong>Full Name:</strong> {currentEmployee.nomComplet || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> {currentEmployee.dateNaissance || 'N/A'}</p>
                <p><strong>Gender:</strong> {currentEmployee.sexe || 'N/A'}</p>
                <p><strong>Grade:</strong> {currentEmployee.grade || 'N/A'}</p>
                <p><strong>Hire Date:</strong> {currentEmployee.dateRecrutement || 'N/A'}</p>
                <p><strong>Diploma:</strong> {currentEmployee.diplome || 'N/A'}</p>
                <p><strong>Affectation:</strong> {currentEmployee.affectation || 'N/A'}</p>
                <p><strong>Marital Status:</strong> {currentEmployee.situationFamiliale || 'N/A'}</p>
                <p><strong>Mission:</strong> {currentEmployee.missionPoste || 'N/A'}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Division:</strong> {currentEmployee.divisionId?.name || 'Unknown'}</p>
                <p><strong>Initial Training:</strong> {currentEmployee.formationInitiale || 'N/A'}</p>
                <p><strong>Main Activity:</strong> {currentEmployee.activitePrincipale || 'N/A'}</p>
                <p><strong>CIN:</strong> {currentEmployee.cin || 'N/A'}</p>
                <p><strong>PPR:</strong> {currentEmployee.ppr || 'N/A'}</p>
                <p><strong>Address:</strong> {currentEmployee.adresse || 'N/A'}</p>
                <p><strong>Email:</strong> {currentEmployee.email || 'N/A'}</p>
                <p><strong>Phone Number:</strong> {currentEmployee.numeroTelephone || 'N/A'}</p>
                <p><strong>External Experience:</strong> {currentEmployee.experienceExterne || 'N/A'}</p>
                <p><strong>Internal Experience:</strong> {currentEmployee.experienceInterne || 'N/A'}</p>
                <p><strong>Contract Type:</strong> {currentEmployee.typeContrat || 'N/A'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeePage;