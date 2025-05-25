import React, { useState, useEffect } from 'react';
import {
  BsPlus,
  BsDownload,
  BsEye,
  BsPencil,
  BsTrash,
  BsSortAlphaDown,
  BsSortAlphaUp,
  BsFilter,
} from 'react-icons/bs';
import { Button, Form, Modal, Badge, Dropdown, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from 'xlsx';

const GRADE_COLORS = {
  'Manager': '#ffc107',
  'Manager RH': '#212529',
  'Analyste': '#0d6efd',
  'Technicienne': '#6c757d',
  'Consultant': '#0dcaf0',
  'Analyste Financier': '#e15759',
  'Coordinatrice': '#76b7b2',
  'Assistante RH': '#59a14f',
  'Architecte': '#edc949',
};

const GradeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [grades, setGrades] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [formData, setFormData] = useState({
    nomComplet: '',
    grade: '',
    missionPoste: '',
    affectation: '',
    divisionId: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [employeesResponse, gradesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/divisions/employees', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/grades', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setEmployees(employeesResponse.data);
        setGrades(gradesResponse.data);
        if (gradesResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, grade: gradesResponse.data[0].name }));
        }
      } catch (error) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const toggleGradeFilter = (grade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade]
    );
  };

  const filtered = employees.filter(
    (emp) =>
      emp.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGrades.length === 0 || selectedGrades.includes(emp.grade))
  );

  const sorted = [...filtered].sort((a, b) =>
    sortAsc
      ? a.nomComplet.localeCompare(b.nomComplet)
      : b.nomComplet.localeCompare(a.nomComplet)
  );

  const toggleSort = (asc) => {
    setSortAsc(asc);
  };

  const openAddModal = () => {
    setEditEmployee(null);
    setFormData({
      nomComplet: '',
      grade: grades[0]?.name || '',
      missionPoste: '',
      affectation: '',
      divisionId: '',
    });
    setShowFormModal(true);
  };

  const openEditModal = (emp) => {
    setEditEmployee(emp);
    setFormData({
      nomComplet: emp.nomComplet,
      grade: emp.grade,
      missionPoste: emp.missionPoste,
      affectation: emp.affectation,
      divisionId: emp.divisionId?._id || '',
    });
    setShowFormModal(true);
  };

  const openDetailsModal = (emp) => {
    console.log('Opening details for:', emp); // Debug log
    setSelectedEmployee(emp || null); // Ensure emp is not undefined
    setShowDetailsModal(true);
  };

  const openDeleteModal = (emp) => {
    setSelectedEmployee(emp);
    setShowDeleteModal(true);
  };

  const deleteEmployee = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/employees/${selectedEmployee._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(
        employees.filter((e) => e._id !== selectedEmployee._id)
      );
      setShowDeleteModal(false);
    } catch (error) {
      setError('Failed to delete employee');
      console.error('Error deleting employee:', error);
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      sorted.map(({ _id, nomComplet, grade, missionPoste, affectation, divisionId }) => ({
        ID: _id,
        Nom: nomComplet,
        Grade: grade,
        Mission: missionPoste,
        Affectation: affectation,
        Division: divisionId?.name || 'N/A',
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employés');
    XLSX.writeFile(wb, 'employes_grades.xlsx');
  };

  const saveEmployee = async () => {
    if (!formData.nomComplet.trim()) {
      setError('Nom is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updatedEmployee = {
        nomComplet: formData.nomComplet,
        grade: formData.grade,
        missionPoste: formData.missionPoste,
        affectation: formData.affectation,
        divisionId: formData.divisionId || null,
        history: editEmployee?.history || [],
      };

      if (editEmployee && editEmployee.grade !== formData.grade) {
        updatedEmployee.history = [
          ...updatedEmployee.history,
          {
            date: new Date().toISOString().split('T')[0],
            from: editEmployee.grade,
            to: formData.grade,
          },
        ];
      }

      if (editEmployee) {
        const response = await axios.put(
          `/api/employees/${editEmployee._id}`,
          updatedEmployee,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees(
          employees.map((e) =>
            e._id === editEmployee._id ? response.data : e
          )
        );
      } else {
        const response = await axios.post(
          '/api/employees',
          updatedEmployee,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees([...employees, response.data]);
      }
      setShowFormModal(false);
      setError('');
    } catch (error) {
      setError('Failed to save employee');
      console.error('Error saving employee:', error);
    }
  };

  const GradeBadge = ({ grade }) => (
    <Badge
      bg=""
      style={{
        backgroundColor: GRADE_COLORS[grade] || '#6c757d',
        color: grade === 'Manager' || grade === 'Manager RH' ? '#000' : '#fff',
      }}
    >
      {grade}
    </Badge>
  );

  const clearGradeFilters = () => {
    setSelectedGrades([]);
  };

  return (
    <div className="min-vh-100 p-4">
      <div className="container-lg">
        <div className="bg-white rounded-3 p-4 shadow-sm">
          {error && <p className="text-danger">{error}</p>}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">Gestion des Grades</h3>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={exportExcel}>
                <BsDownload className="me-2" /> Exporter
              </Button>
              <Button variant="primary" onClick={openAddModal}>
                <BsPlus size={20} className="me-2" /> Ajouter
              </Button>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-3 mb-3 align-items-center">
            <div className="flex-grow-1">
              <Form.Control
                type="text"
                placeholder="Rechercher un nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ButtonGroup>
              <Button
                variant={sortAsc ? 'primary' : 'outline-secondary'}
                onClick={() => toggleSort(true)}
              >
                <BsSortAlphaDown />
              </Button>
              <Button
                variant={!sortAsc ? 'primary' : 'outline-secondary'}
                onClick={() => toggleSort(false)}
              >
                <BsSortAlphaUp />
              </Button>
            </ButtonGroup>
            <Dropdown>
              <Dropdown.Toggle variant="outline-dark">
                <BsFilter className="me-2" /> Grades
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {grades.map((grade) => (
                  <Dropdown.Item
                    key={grade._id}
                    active={selectedGrades.includes(grade.name)}
                    onClick={() => toggleGradeFilter(grade.name)}
                  >
                    {grade.name}
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item onClick={clearGradeFilters}>
                  Effacer les filtres
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {selectedGrades.length > 0 && (
            <div className="mb-3">
              <small className="text-muted">
                Filtres actifs: {selectedGrades.join(', ')}
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger p-0 ms-2"
                  onClick={clearGradeFilters}
                >
                  Effacer
                </Button>
              </small>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nom</th>
                  <th>Grade</th>
                  <th>Mission</th>
                  <th>Division</th>
                  <th>Affectation</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length > 0 ? (
                  sorted.map((emp) => (
                    <tr key={emp._id}>
                      <td>{emp.nomComplet}</td>
                      <td>
                        <GradeBadge grade={emp.grade} />
                      </td>
                      <td>{emp.missionPoste || 'N/A'}</td>
                      <td>{emp.divisionId?.name || 'N/A'}</td>
                      <td>{emp.affectation || 'N/A'}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => openEditModal(emp)}
                            style={{ color: '#0d6efd' }}
                          >
                            <BsPencil />
                          </Button>
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => openDetailsModal(emp)}
                            style={{ color: '#000000' }}
                          >
                            <BsEye />
                          </Button>
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => openDeleteModal(emp)}
                            style={{ color: '#dc3545' }}
                          >
                            <BsTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center text-muted py-4"
                    >
                      Aucun employé trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Modal
            show={showDetailsModal}
            onHide={() => {
              setShowDetailsModal(false);
              setSelectedEmployee(null); // Clear selectedEmployee when closing
            }}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Détails de l'employé</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedEmployee ? (
                <div>
                  <p>
                    <strong>Nom :</strong>{' '}
                    {selectedEmployee.nomComplet}
                  </p>
                  <p>
                    <strong>Grade :</strong>{' '}
                    {selectedEmployee.grade}
                  </p>
                  <p>
                    <strong>Mission :</strong>{' '}
                    {selectedEmployee.missionPoste || 'N/A'}
                  </p>
                  <p>
                    <strong>Division :</strong>{' '}
                    {selectedEmployee.divisionId?.name || 'N/A'}
                  </p>
                  <p>
                    <strong>Affectation :</strong>{' '}
                    {selectedEmployee.affectation || 'N/A'}
                  </p>
                  <hr />
                  <p>
                    <strong>Historique des promotions :</strong>
                  </p>
                  <ul>
                    {selectedEmployee.history && selectedEmployee.history.length === 0 ? (
                      <li>Aucune promotion</li>
                    ) : (
                      (selectedEmployee.history || []).map((entry, i) => (
                        <li key={i}>
                          {new Date(entry.date).toLocaleDateString()}:{' '}
                          {entry.from} → {entry.to}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ) : (
                <p className="text-center text-muted">Aucun employé sélectionné</p>
              )}
            </Modal.Body>
          </Modal>

          <Modal
            show={showFormModal}
            onHide={() => setShowFormModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {editEmployee ? 'Modifier' : 'Ajouter'} un Employé
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <p className="text-danger">{error}</p>}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nomComplet}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomComplet: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Grade</Form.Label>
                  <Form.Select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        grade: e.target.value,
                      })
                    }
                  >
                    {grades.map((grade) => (
                      <option key={grade._id} value={grade.name}>{grade.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mission</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.missionPoste}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        missionPoste: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Affectation</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.affectation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        affectation: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Division ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.divisionId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        divisionId: e.target.value,
                      })
                    }
                    placeholder="Enter Division ID (optional)"
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowFormModal(false)}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={saveEmployee}>
                Enregistrer
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            centered
          >
            <Modal.Header closeButton className="border-0 pb-0">
              <Modal.Title>Confirmation de suppression</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              <div className="fs-5 mb-3">
                Vous voulez vraiment supprimer{' '}
                {selectedEmployee?.nomComplet} ?
              </div>
              <div className="d-flex justify-content-center gap-3">
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4"
                >
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={deleteEmployee}
                  className="px-4"
                >
                  Confirmer
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default GradeManagement;