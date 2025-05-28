import React, { useState, useEffect } from "react";
import {
  BsPlus,
  BsDownload,
  BsEye,
  BsPencil,
  BsTrash,
  BsSortAlphaDown,
  BsSortAlphaUp,
  BsFilter,
} from "react-icons/bs";
import { Button, Form, Modal, Badge, Dropdown, ButtonGroup, Card, Alert } from "react-bootstrap";
import axios from "axios";
import * as XLSX from "xlsx";

// Updated GRADE_COLORS with improved readability
const GRADE_COLORS = {
  Manager: "#ffc107", // Yellow, use dark text
  "Manager RH": "#343a40", // Darker gray for better contrast, use white text
  Analyste: "#0d6efd", // Blue, use white text
  Technicienne: "#6c757d", // Gray, use white text
  Consultant: "#0dcaf0", // Cyan, use white text
  "Analyste Financier": "#e15759", // Red, use white text
  Coordinatrice: "#76b7b2", // Teal, use white text
  "Assistante RH": "#59a14f", // Green, use white text
  Architecte: "#edc949", // Light orange, use dark text
};

// Function to determine text color based on background luminance
const getTextColor = (bgColor) => {
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

const GradeManagement = ({ theme = "light" }) => {
  const [employees, setEmployees] = useState([]);
  const [grades, setGrades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [formData, setFormData] = useState({
    nomComplet: "",
    grade: "",
    missionPoste: "",
    affectation: "",
    divisionId: "",
  });
  const [error, setError] = useState("");
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [employeesResponse, gradesResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/divisions/employees", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/grades", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setEmployees(employeesResponse.data);
        setGrades(gradesResponse.data);
        if (gradesResponse.data.length > 0) {
          setFormData((prev) => ({ ...prev, grade: gradesResponse.data[0].name }));
        }
      } catch (error) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setTimeout(() => {
        setBanners((prev) => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [banners]);

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
      nomComplet: "",
      grade: grades[0]?.name || "",
      missionPoste: "",
      affectation: "",
      divisionId: "",
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
      divisionId: emp.divisionId?._id || "",
    });
    setShowFormModal(true);
  };

  const openDetailsModal = (emp) => {
    console.log("Opening details for:", emp);
    setSelectedEmployee(emp || null);
    setShowDetailsModal(true);
  };

  const openDeleteModal = (emp) => {
    setSelectedEmployee(emp);
    setShowDeleteModal(true);
  };

  const deleteEmployee = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/employees/${selectedEmployee._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(employees.filter((e) => e._id !== selectedEmployee._id));
      setBanners((prev) => [
        ...prev,
        { id: Date.now(), message: `Employé ${selectedEmployee.nomComplet} supprimé avec succès` },
      ]);
      setShowDeleteModal(false);
    } catch (error) {
      setError("Failed to delete employee");
      console.error("Error deleting employee:", error);
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
        Division: divisionId?.name || "N/A",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employés");
    XLSX.writeFile(wb, "employes_grades.xlsx");
  };

  const saveEmployee = async () => {
    if (!formData.nomComplet.trim()) {
      setError("Nom is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
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
            date: new Date().toISOString().split("T")[0],
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
          employees.map((e) => (e._id === editEmployee._id ? response.data : e))
        );
        setBanners((prev) => [
          ...prev,
          { id: Date.now(), message: `Employé ${editEmployee.nomComplet} modifié` },
        ]);
      } else {
        const response = await axios.post(
          "/api/employees",
          updatedEmployee,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees([...employees, response.data]);
        setBanners((prev) => [
          ...prev,
          { id: Date.now(), message: `Employé ${formData.nomComplet} ajouté avec succès` },
        ]);
      }
      setShowFormModal(false);
      setError("");
    } catch (error) {
      setError("Failed to save employee");
      console.error("Error saving employee:", error);
    }
  };

  const GradeBadge = ({ grade }) => (
    <Badge
      bg=""
      style={{
        backgroundColor: GRADE_COLORS[grade] || "#6c757d",
        color: getTextColor(GRADE_COLORS[grade] || "#6c757d"),
        padding: "0.25rem 0.5rem",
        borderRadius: "0.25rem",
      }}
    >
      {grade}
    </Badge>
  );

  const clearGradeFilters = () => {
    setSelectedGrades([]);
  };

  return (
    <>
      <style>
        {`
          .app-container {
            background-color: ${theme === 'dark' ? '#14131f' : '#ffffff'};
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
            padding: 2rem;
            min-height: 100vh;
            position: relative;
          }

          .card-custom, .modal-content {
            background-color: ${theme === 'dark' ? '#2a2a3a' : '#ffffff'};
            border: 1px solid ${theme === 'dark' ? '#3a3a4a' : '#dee2e6'};
            border-radius: 10px;
            box-shadow: none;
            padding: 1.5rem;
            width: 100%;
          }

          .modal-header {
            background-color: ${theme === 'dark' ? '#3a3a4a' : '#f8f9fa'};
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'};
            position: sticky;
            top: 0;
            z-index: 1;
          }

          .modal-body {
            max-height: 60vh;
            overflow-y: auto;
            padding: 1.5rem;
          }

          .table-custom {
            background-color: ${theme === 'dark' ? '#302d4d' : '#f8f9fa'};
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
          }

          .table-custom thead {
            background-color: ${theme === 'dark' ? '#302d4d' : '#e9ecef'};
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
          }

          .table-custom tbody tr:hover {
            background-color: ${theme === 'dark' ? 'rgba(48, 45, 77, 0.5)' : 'rgba(0, 0, 0, 0.05)'};
          }

          .table-custom tbody tr {
            background-color: transparent;
          }

          .table-container {
            overflow-x: auto;
            width: 100%;
          }

          .table-custom th, .table-custom td {
            white-space: nowrap;
            padding: 0.75rem;
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
          }

          .btn-primary {
            background-color: ${theme === 'dark' ? '#1e3a8a' : '#1e40af'};
            border-color: ${theme === 'dark' ? '#1e3a8a' : '#1e40af'};
            color: ${theme === 'dark' ? '#ffffff' : '#ffffff'};
          }

          .btn-primary:hover {
            background-color: ${theme === 'dark' ? '#163373' : '#163373'};
            border-color: ${theme === 'dark' ? '#163373' : '#163373'};
            color: ${theme === 'dark' ? '#ffffff' : '#ffffff'};
          }

          .btn-outline-secondary {
            color: ${theme === 'dark' ? '#a0a0a0' : '#6c757d'};
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#ced4da'};
          }

          .btn-outline-secondary:hover {
            background-color: ${theme === 'dark' ? '#3a3a4a' : '#e9ecef'};
            color: ${theme === 'dark' ? '#e0e0e0' : '#495057'};
          }

          .btn-success {
            background-color: ${theme === 'dark' ? '#166534' : '#28a745'};
            border-color: ${theme === 'dark' ? '#166534' : '#28a745'};
            color: ${theme === 'dark' ? '#ffffff' : '#ffffff'};
          }

          .btn-success:hover {
            background-color: ${theme === 'dark' ? '#14532d' : '#218838'};
            border-color: ${theme === 'dark' ? '#14532d' : '#218838'};
            color: ${theme === 'dark' ? '#ffffff' : '#ffffff'};
          }

          .text-muted {
            color: ${theme === 'dark' ? '#a0a0a0' : '#6c757d'} !important;
          }

          .form-control, .form-select {
            background-color: ${theme === 'dark' ? '#3a3a4a' : '#ffffff'};
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#ced4da'};
          }

          .dropdown-menu {
            background-color: ${theme === 'dark' ? '#2a2a3a' : '#ffffff'};
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'};
          }

          .dropdown-item {
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
          }

          .dropdown-item:hover {
            background-color: ${theme === 'dark' ? '#3a3a4a' : '#f8f9fa'};
            color: ${theme === 'dark' ? '#ffffff' : '#495057'};
          }

          .alert-danger {
            background-color: ${theme === 'dark' ? '#7f1d1d' : '#f8d7da'};
            color: ${theme === 'dark' ? '#f9a8a8' : '#721c24'};
            border-color: ${theme === 'dark' ? '#991b1b' : '#f5c6cb'};
          }

          .backdrop-custom {
            background-color: ${theme === 'dark' ? 'rgba(20, 19, 31, 0.8)' : 'rgba(0, 0, 0, 0.5)'};
          }

          .delete-card {
            background-color: ${theme === 'dark' ? '#2a2a3a' : '#ffffff'};
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
            border: 1px solid ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'};
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .delete-card .btn-danger {
            background-color: ${theme === 'dark' ? '#dc3545' : '#dc3545'};
            border-color: ${theme === 'dark' ? '#dc3545' : '#dc3545'};
            color: ${theme === 'dark' ? '#ffffff' : '#ffffff'};
          }

          .delete-card .btn-outline-light {
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#ced4da'};
          }

          .form-group-compact {
            margin-bottom: 0.5rem !important;
          }

          .form-label-compact {
            margin-bottom: 0.2rem !important;
            font-size: 0.9rem;
          }

          .form-control-compact {
            padding: 0.3rem 0.5rem;
            height: 1.8rem;
            font-size: 0.9rem;
          }

          .banner {
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: 400px;
            background-color: ${theme === 'dark' ? '#2a2a3a' : '#ffffff'};
            border: 1px solid ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'};
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 10px 15px;
            z-index: 1003;
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
            text-align: center;
            animation: fadeInOut 5s ease-in-out forwards;
          }

          @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; }
          }

          /* Action buttons in table */
          .table-custom .btn-link {
            color: ${theme === 'dark' ? '#ffffff' : '#1e40af'};
          }

          .table-custom .btn-link.text-danger {
            color: ${theme === 'dark' ? '#dc3545' : '#dc3545'} !important;
          }
        `}
      </style>
      <div className="app-container">
        <div className="card-custom">
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">Gestion des Grades</h3>
            <div className="d-flex gap-2">
              <Button variant="success" onClick={exportExcel}>
                <BsDownload className="me-2" /> Exporter
              </Button>
              <Button variant="primary" onClick={openAddModal}>
                <BsPlus size={20} className="me-2" /> Ajouter
              </Button>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
            <Form.Control
              type="text"
              placeholder="Rechercher un nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow-1"
            />
            <ButtonGroup>
              <Button
                variant={sortAsc ? "primary" : "outline-secondary"}
                onClick={() => toggleSort(true)}
              >
                <BsSortAlphaDown />
              </Button>
              <Button
                variant={!sortAsc ? "primary" : "outline-secondary"}
                onClick={() => toggleSort(false)}
              >
                <BsSortAlphaUp />
              </Button>
            </ButtonGroup>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary">
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
                <Dropdown.Item onClick={clearGradeFilters}>
                  Effacer les filtres
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {selectedGrades.length > 0 && (
            <div className="mb-4">
              <small className="text-muted">
                Filtres actifs: {selectedGrades.join(", ")}
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

          <div className="table-container">
            <table className="table-custom table">
              <thead>
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
                      <td>{emp.missionPoste || "N/A"}</td>
                      <td>{emp.divisionId?.name || "N/A"}</td>
                      <td>{emp.affectation || "N/A"}</td>
                      <td className="text-center">
                        <Button
                          variant="link"
                          className="text-primary"
                          onClick={() => openEditModal(emp)}
                        >
                          <BsPencil />
                        </Button>
                        <Button
                          variant="link"
                          className="text-muted"
                          onClick={() => openDetailsModal(emp)}
                        >
                          <BsEye />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger"
                          onClick={() => openDeleteModal(emp)}
                        >
                          <BsTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      Aucun employé trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {banners.map((banner) => (
            <div key={banner.id} className="banner">
              {banner.message}
            </div>
          ))}

          <Modal
            show={showDetailsModal}
            onHide={() => {
              setShowDetailsModal(false);
              setSelectedEmployee(null);
            }}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Détails de l'employé</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4">
              {selectedEmployee ? (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <strong>Nom :</strong> {selectedEmployee.nomComplet}
                  </div>
                  <div className="col-12 col-md-6">
                    <strong>Grade :</strong> {selectedEmployee.grade}
                  </div>
                  <div className="col-12 col-md-6">
                    <strong>Mission :</strong> {selectedEmployee.missionPoste || "N/A"}
                  </div>
                  <div className="col-12 col-md-6">
                    <strong>Division :</strong> {selectedEmployee.divisionId?.name || "N/A"}
                  </div>
                  <div className="col-12 col-md-6">
                    <strong>Affectation :</strong> {selectedEmployee.affectation || "N/A"}
                  </div>
                  <div className="col-12">
                    <strong>Historique des promotions :</strong>
                    <ul>
                      {selectedEmployee.history && selectedEmployee.history.length === 0 ? (
                        <li>Aucune promotion</li>
                      ) : (
                        (selectedEmployee.history || []).map((entry, i) => (
                          <li key={i}>
                            {new Date(entry.date).toLocaleDateString()}: {entry.from} →{" "}
                            {entry.to}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
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
                {editEmployee ? "Modifier" : "Ajouter"} un Employé
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveEmployee();
                }}
                className="d-flex flex-wrap justify-content-center gap-3"
              >
                <Form.Group className="form-group-compact" style={{ flex: "1 1 48%", minWidth: "200px" }}>
                  <Form.Label className="form-label-compact">Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nomComplet}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomComplet: e.target.value,
                      })
                    }
                    className="form-control-compact"
                    style={{ borderRadius: "0.3rem" }}
                    required
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: "1 1 48%", minWidth: "200px" }}>
                  <Form.Label className="form-label-compact">Grade</Form.Label>
                  <Form.Select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        grade: e.target.value,
                      })
                    }
                    className="form-control-compact"
                    style={{ borderRadius: "0.3rem" }}
                  >
                    {grades.map((grade) => (
                      <option key={grade._id} value={grade.name}>
                        {grade.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: "1 1 48%", minWidth: "200px" }}>
                  <Form.Label className="form-label-compact">Mission</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.missionPoste}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        missionPoste: e.target.value,
                      })
                    }
                    className="form-control-compact"
                    style={{ borderRadius: "0.3rem" }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: "1 1 48%", minWidth: "200px" }}>
                  <Form.Label className="form-label-compact">Affectation</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.affectation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        affectation: e.target.value,
                      })
                    }
                    className="form-control-compact"
                    style={{ borderRadius: "0.3rem" }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: "1 1 48%", minWidth: "200px" }}>
                  <Form.Label className="form-label-compact">Division ID</Form.Label>
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
                    className="form-control-compact"
                    style={{ borderRadius: "0.3rem" }}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  className="mt-3 w-100"
                  style={{ borderRadius: "0.3rem" }}
                >
                  Enregistrer
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {showDeleteModal && (
            <div className="position-fixed top-0 start-0 w-100 h-100 backdrop-custom" style={{ zIndex: 1050 }}>
              <Card className="position-absolute top-50 start-50 translate-middle delete-card" style={{ width: "20rem" }}>
                <Card.Body>
                  <Card.Title>Confirmer la Suppression</Card.Title>
                  <Card.Text>
                    Êtes-vous sûr de vouloir supprimer l'employé{" "}
                    <strong>{selectedEmployee?.nomComplet}</strong> ?
                  </Card.Text>
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <Button
                      variant="danger"
                      onClick={deleteEmployee}
                      style={{ width: "80px" }}
                    >
                      Oui
                    </Button>
                    <Button
                      variant="outline-light"
                      onClick={() => setShowDeleteModal(false)}
                      style={{ width: "80px" }}
                    >
                      Non
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GradeManagement;