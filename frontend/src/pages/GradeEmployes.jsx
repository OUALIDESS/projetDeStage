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

const PREDEFINED_GRADES = [
  'Ingénieur junior',
  'Ingénieur confirmé',
  'Senior',
  'Manager',
  'Directeur',
];

const GRADE_COLORS = {
  'Ingénieur junior': '#6c757d',
  'Ingénieur confirmé': '#0dcaf0',
  'Senior': '#0d6efd',
  'Manager': '#ffc107',
  'Directeur': '#212529',
};

const GradeManagement = () => {
  const [employees, setEmployees] = useState([]);
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
    grade: PREDEFINED_GRADES[0],
    seniority: 1,
  });
  const [error, setError] = useState('');

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
      grade: PREDEFINED_GRADES[0],
      seniority: 1,
    });
    setShowFormModal(true);
  };

  const openEditModal = (emp) => {
    setEditEmployee(emp);
    setFormData({
      nomComplet: emp.nomComplet,
      grade: emp.grade,
      seniority: emp.seniority,
    });
    setShowFormModal(true);
  };

  const openDetailsModal = (emp) => {
    setSelectedEmployee(emp);
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
      sorted.map(({ _id, nomComplet, grade, seniority }) => ({
        ID: _id,
        Nom: nomComplet,
        Grade: grade,
        Ancienneté: seniority,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employés');
    XLSX.writeFile(wb, 'employes_grades.xlsx');
  };

  const saveEmployee = async () => {
    if (!formData.nomComplet.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const updatedEmployee = {
        nomComplet: formData.nomComplet,
        grade: formData.grade,
        seniority: Number(formData.seniority),
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
    } catch (error) {
      setError('Failed to save employee');
      console.error('Error saving employee:', error);
    }
  };

  const GradeBadge = ({ grade }) => (
    <Badge
      bg=""
      style={{
        backgroundColor: GRADE_COLORS[grade],
        color: grade === 'Manager' ? '#000' : '#fff',
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
                {PREDEFINED_GRADES.map((grade) => (
                  <Dropdown.Item
                    key={grade}
                    active={selectedGrades.includes(grade)}
                    onClick={() => toggleGradeFilter(grade)}
                  >
                    {grade}
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
                  <th>Ancienneté</th>
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
                      <td>{emp.seniority} ans</td>
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
                      colSpan="4"
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
                    {PREDEFINED_GRADES.map((grade) => (
                      <option key={grade}>{grade}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Ancienneté (années)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.seniority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seniority: e.target.value,
                      })
                    }
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

          <Modal
            show={showDetailsModal}
            onHide={() => setShowDetailsModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Détails de l'employé</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedEmployee && (
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
                    <strong>Ancienneté :</strong>{' '}
                    {selectedEmployee.seniority} ans
                  </p>
                  <hr />
                  <p>
                    <strong>Historique des promotions :</strong>
                  </p>
                  <ul>
                    {selectedEmployee.history.length === 0 ? (
                      <li>Aucune promotion</li>
                    ) : (
                      selectedEmployee.history.map((entry, i) => (
                        <li key={i}>
                          {new Date(entry.date).toLocaleDateString()}:{' '}
                          {entry.from} → {entry.to}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default GradeManagement;