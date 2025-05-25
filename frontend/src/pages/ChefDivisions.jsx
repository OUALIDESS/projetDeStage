import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, Alert, Button, Modal, Form, Card, ListGroup } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import 'bootstrap/dist/css/bootstrap.min.css';

const ChefDivisions = () => {
  const navigate = useNavigate();
  const [divisions, setDivisions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [formData, setFormData] = useState({ divisionId: '', managerId: '', employeeIds: [] });
  const [selectedManager, setSelectedManager] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to access this page');
          navigate('/login');
          return;
        }

        const divisionRes = await axios.get('http://localhost:5000/api/divisions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Divisions:', divisionRes.data);

        const divisionsWithDetails = divisionRes.data.map((division) => {
          const employees = division.employeeIds.filter(
            (emp) => !division.managerId || emp._id.toString() !== division.managerId.toString()
          );
          return {
            ...division,
            employeeNames: employees.length > 0
              ? employees.map((emp) => emp.nomComplet).join(', ')
              : 'No Employees',
          };
        });
        setDivisions(divisionsWithDetails);

        const employeeRes = await axios.get('http://localhost:5000/api/employees', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Employees:', employeeRes.data);
        setEmployees(employeeRes.data);

        const gradeRes = await axios.get('http://localhost:5000/api/grades', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Grades:', gradeRes.data);
        setGrades(gradeRes.data);
      } catch (err) {
        setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, [navigate]);

  const handleRowClick = (divisionName) => {
    navigate(`/divisions/${divisionName.toLowerCase()}`);
  };

  const handleModifyModalOpen = (division) => {
    console.log('Opening Modify for division:', division);
    setSelectedDivision(division);
    setFormData({
      divisionId: division._id,
      managerId: division.managerId ? division.managerId._id : '',
      employeeIds: division.employeeIds.map((emp) => emp._id),
    });
    setShowModifyModal(true);
  };

  const handleDetailsModalOpen = async (division) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/divisions/${division._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedManager(res.data.managerId);
      setShowDetailsModal(true);
    } catch (err) {
      setError('Failed to fetch manager details: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleModalClose = () => {
    setShowModifyModal(false);
    setShowDetailsModal(false);
    setSelectedDivision(null);
    setSelectedManager(null);
    setFormData({ divisionId: '', managerId: '', employeeIds: [] });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form:', formData);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        managerId: formData.managerId || null,
        employeeIds: formData.employeeIds,
      };
      const url = `http://localhost:5000/api/divisions/${formData.divisionId}`;

      const res = await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Backend response:', res.data);

      const updatedDivision = res.data;
      const updatedDivisions = divisions.map((div) =>
        div._id === updatedDivision._id
          ? {
              ...updatedDivision,
              employeeNames:
                updatedDivision.employeeIds
                  .filter(
                    (emp) =>
                      !updatedDivision.managerId ||
                      emp._id.toString() !== updatedDivision.managerId.toString()
                  )
                  .map((emp) => emp.nomComplet)
                  .join(', ') || 'No Employees',
            }
          : div
      );

      setDivisions(updatedDivisions);
      handleModalClose();
    } catch (err) {
      setError('Failed to save changes: ' + (err.response?.data?.message || err.message));
      console.error('Submit error:', err.response?.data || err);
    }
  };

  const handleDelete = async (divisionId) => {
    if (!window.confirm('Are you sure you want to remove this manager?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/divisions/${divisionId}`,
        { managerId: null },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDivisions(
        divisions.map((div) =>
          div._id === divisionId
            ? {
                ...res.data,
                employeeNames:
                  res.data.employeeIds.map((emp) => emp.nomComplet).join(', ') ||
                  'No Employees',
              }
            : div
        )
      );
    } catch (err) {
      setError('Failed to delete manager: ' + (err.response?.data?.message || err.message));
    }
  };

  // Load manager options from DB
  const loadManagerOptions = async (inputValue) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      // Fallback to hardcoded grades if grades state is empty
      const managerGrades = grades.length > 0
        ? grades
            .filter((grade) => grade.name.toLowerCase().includes('manager'))
            .map((grade) => grade.name)
        : ['Manager', 'Manager RH'];
      const params = new URLSearchParams({
        query: inputValue || '',
        grade: managerGrades.join(','),
        divisionId: selectedDivision?._id || '',
      }).toString();
      console.log('Manager search request:', `http://localhost:5000/api/employees/search?${params}`);
      const res = await axios.get(`http://localhost:5000/api/employees/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Manager search response:', res.data);
      return res.data.map((emp) => ({
        value: emp._id,
        label: `${emp.nomComplet} (${emp.grade || 'N/A'})`,
      }));
    } catch (err) {
      console.error('Error loading managers:', err.response?.data || err.message);
      return [];
    }
  };

  // Load employee options from DB
  const loadEmployeeOptions = async (inputValue) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const params = new URLSearchParams({
        query: inputValue || '',
        divisionId: selectedDivision?._id || '',
      }).toString();
      console.log('Employee search request:', `http://localhost:5000/api/employees/search?${params}`);
      const res = await axios.get(`http://localhost:5000/api/employees/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Employee search response:', res.data);
      return res.data.map((emp) => ({
        value: emp._id,
        label: `${emp.nomComplet} (${emp.grade || 'N/A'})`,
      }));
    } catch (err) {
      console.error('Error loading employees:', err.response?.data || err.message);
      return [];
    }
  };

  // Get employees for lists
  const getDivisionEmployees = (divisionId) =>
    employees
      .filter((emp) => emp.divisionId && emp.divisionId.toString() === divisionId.toString())
      .map((emp) => ({
        value: emp._id,
        label: `${emp.nomComplet} (${emp.grade || 'N/A'})`,
      }));
  const getDivisionManagers = (divisionId) =>
    employees
      .filter(
        (emp) =>
          emp.divisionId &&
          emp.divisionId.toString() === divisionId.toString() &&
          emp.grade &&
          (grades.length > 0
            ? grades
                .filter((grade) => grade.name.toLowerCase().includes('manager'))
                .map((grade) => grade.name)
                .includes(emp.grade)
            : ['Manager', 'Manager RH'].includes(emp.grade))
      )
      .map((emp) => ({
        value: emp._id,
        label: `${emp.nomComplet} (${emp.grade})`,
      }));
  console.log('Division managers:', selectedDivision ? getDivisionManagers(selectedDivision._id) : []);
  console.log('Division employees:', selectedDivision ? getDivisionEmployees(selectedDivision._id) : []);

  return (
    <div className="bg-white rounded-3 shadow-sm p-4 mx-auto" style={{ maxWidth: '1200px', margin: '20px' }}>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-semibold">Managers des Divisions</h5>
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Division</th>
            <th>Manager</th>
            <th>Grade</th>
            <th>Mission</th>
            <th>Employees Managed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {divisions.map((division) => (
            <tr
              key={division._id}
              onClick={() => handleRowClick(division.name)}
              style={{ cursor: 'pointer' }}
            >
              <td>{division.name}</td>
              <td>{division.managerId ? division.managerId.nomComplet : 'No Manager Assigned'}</td>
              <td>{division.managerId ? division.managerId.grade : '-'}</td>
              <td>{division.managerId ? division.managerId.missionPoste : '-'}</td>
              <td>{division.employeeNames}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="info"
                  size="sm"
                  className="me-1"
                  onClick={() => handleDetailsModalOpen(division)}
                >
                  Details
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-1"
                  onClick={() => handleModifyModalOpen(division)}
                >
                  Modify
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(division._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modify Manager Modal */}
      <Modal show={showModifyModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modify Manager</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Division</Form.Label>
              <Form.Control
                type="text"
                value={selectedDivision ? selectedDivision.name : ''}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Manager</Form.Label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadManagerOptions}
                value={
                  formData.managerId
                    ? {
                        value: formData.managerId,
                        label:
                          employees.find((e) => e._id.toString() === formData.managerId.toString())?.nomComplet +
                          ` (${
                            employees.find((e) => e._id.toString() === formData.managerId.toString())?.grade || 'N/A'
                          })`,
                      }
                    : null
                }
                onChange={(option) =>
                  setFormData({ ...formData, managerId: option ? option.value : '' })
                }
                placeholder="Type to search managers..."
                isClearable
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Employees Managed</Form.Label>
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                loadOptions={loadEmployeeOptions}
                value={formData.employeeIds
                  .map((id) => {
                    const emp = employees.find((e) => e._id.toString() === id.toString());
                    return emp
                      ? {
                          value: emp._id,
                          label: `${emp.nomComplet} (${emp.grade || 'N/A'})`,
                        }
                      : null;
                  })
                  .filter((option) => option !== null)}
                onChange={(options) =>
                  setFormData({
                    ...formData,
                    employeeIds: options.map((opt) => opt.value),
                  })
                }
                placeholder="Type to search employees..."
              />
            </Form.Group>
            {selectedDivision && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Available Managers</Form.Label>
                  <ListGroup>
                    {getDivisionManagers(selectedDivision._id).map((emp) => (
                      <ListGroup.Item key={emp.value}>{emp.label}</ListGroup.Item>
                    ))}
                  </ListGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Current Employees</Form.Label>
                  <ListGroup>
                    {getDivisionEmployees(selectedDivision._id).map((emp) => (
                      <ListGroup.Item key={emp.value}>{emp.label}</ListGroup.Item>
                    ))}
                  </ListGroup>
                </Form.Group>
              </>
            )}
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View Details Modal */}
      <Modal show={showDetailsModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Manager Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedManager ? (
            <Card>
              <Card.Body>
                <Card.Title>{selectedManager.nomComplet}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{selectedManager.grade}</Card.Subtitle>
                <Card.Text>
                  <strong>Mission:</strong> {selectedManager.missionPoste}<br />
                  <strong>Date of Birth:</strong>{' '}
                  {new Date(selectedManager.dateNaissance).toLocaleDateString()}<br />
                  <strong>Gender:</strong> {selectedManager.sexe}<br />
                  <strong>Email:</strong> {selectedManager.email}<br />
                  <strong>Phone Number:</strong> {selectedManager.numeroTelephone}<br />
                  <strong>Hire Date:</strong>{' '}
                  {new Date(selectedManager.dateRecrutement).toLocaleDateString()}<br />
                  <strong>Degree:</strong> {selectedManager.diplome}<br />
                  <strong>Assignment:</strong> {selectedManager.affectation}<br />
                  <strong>Marital Status:</strong> {selectedManager.situationFamiliale}<br />
                  <strong>Initial Training:</strong> {selectedManager.formationInitiale}<br />
                  <strong>Main Activity:</strong> {selectedManager.activitePrincipale}<br />
                  <strong>CIN:</strong> {selectedManager.cin}<br />
                  <strong>PPR:</strong> {selectedManager.ppr}<br />
                  <strong>Address:</strong> {selectedManager.adresse}<br />
                  <strong>External Experience:</strong> {selectedManager.experienceExterne}<br />
                  <strong>Internal Experience:</strong> {selectedManager.experienceInterne}
                </Card.Text>
              </Card.Body>
            </Card>
          ) : (
            <p>No details available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChefDivisions;