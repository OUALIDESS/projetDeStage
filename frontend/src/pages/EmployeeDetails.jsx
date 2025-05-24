import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [infosSupplementaires, setInfosSupplementaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newInfoTitre, setNewInfoTitre] = useState("");
  const [newInfoDesc, setNewInfoDesc] = useState("");
  const [editInfoTitre, setEditInfoTitre] = useState("");
  const [editInfoDesc, setEditInfoDesc] = useState("");
  const [selectedInfo, setSelectedInfo] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to access this page');
          navigate('/login');
          return;
        }

        const response = await axios.get(`/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployee(response.data);
        setInfosSupplementaires(response.data.supplementaryInfo || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch employee details');
        setLoading(false);
        console.error('Error fetching employee:', err);
      }
    };
    fetchEmployee();
  }, [id, navigate]);

  const handleAddInfo = async (e) => {
    e.preventDefault();
    if (!newInfoTitre.trim() || !newInfoDesc.trim()) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const newInfo = { titre: newInfoTitre, description: newInfoDesc };
      const updatedInfos = [...infosSupplementaires, newInfo];
      await axios.put(`/api/employees/${id}`, {
        ...employee,
        supplementaryInfo: updatedInfos,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInfosSupplementaires(updatedInfos);
      setModalOpen(false);
      setNewInfoTitre("");
      setNewInfoDesc("");
      setError('');
    } catch (err) {
      setError('Failed to add information');
      console.error('Error adding info:', err);
    }
  };

  const handleEdit = (index) => {
    const info = infosSupplementaires[index];
    setEditInfoTitre(info.titre);
    setEditInfoDesc(info.description);
    setSelectedInfo(index);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editInfoTitre.trim() || !editInfoDesc.trim()) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const updatedInfos = [...infosSupplementaires];
      updatedInfos[selectedInfo] = { titre: editInfoTitre, description: editInfoDesc };
      await axios.put(`/api/employees/${id}`, {
        ...employee,
        supplementaryInfo: updatedInfos,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInfosSupplementaires(updatedInfos);
      setEditModalOpen(false);
      setSelectedInfo(null);
      setError('');
    } catch (err) {
      setError('Failed to update information');
      console.error('Error updating info:', err);
    }
  };

  const handleDeleteInfo = async (index) => {
    if (!window.confirm("Are you sure you want to delete this information?")) return;
    try {
      const token = localStorage.getItem('token');
      const updatedInfos = infosSupplementaires.filter((_, i) => i !== index);
      await axios.put(`/api/employees/${id}`, {
        ...employee,
        supplementaryInfo: updatedInfos,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInfosSupplementaires(updatedInfos);
      setSelectedInfo(null);
      setError('');
    } catch (err) {
      setError('Failed to delete information');
      console.error('Error deleting info:', err);
    }
  };

  const handleExportPDF = async () => {
    const element = document.createElement("div");
    element.style.width = "1200px";
    element.style.padding = "20px";
    element.style.backgroundColor = "white";
    element.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
    const original = document.querySelector(".container.my-5.shadow.p-4.rounded.bg-white").cloneNode(true);
    original.querySelectorAll("button, .btn").forEach(btn => btn.remove());
    element.appendChild(original);
    document.body.appendChild(element);
    element.style.position = "absolute";
    element.style.left = "-9999px";
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${employee.nomComplet.replace(/\s+/g, '_')}_CV.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF');
    } finally {
      document.body.removeChild(element);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;
  if (!employee) return <p className="text-center mt-5">Employee not found</p>;

  return (
    <div className="container my-5 shadow p-4 rounded bg-white" style={{ maxWidth: "1200px" }}>
      {error && <p className="text-danger">{error}</p>}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <Link to="/pages/Employees" className="btn btn-outline-primary">
          ← Back to Employees
        </Link>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={handleExportPDF}>
            Export PDF
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={() => setModalOpen(true)}>
            Add Info
          </Button>
        </div>
      </div>
      <div className="d-flex align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">{employee.nomComplet}</h2>
          <p className="text-muted mb-0">{employee.missionPoste} - {employee.grade}</p>
        </div>
      </div>
      <hr />
      <section className="mb-4">
        <h5 className="mb-3 text-primary">Personal Information</h5>
        <div className="row">
          {[
            ['Date of Birth', employee.dateNaissance],
            ['Gender', employee.sexe],
            ['Grade', employee.grade],
            ['Hire Date', employee.dateRecrutement],
            ['Diploma', employee.diplome],
            ['Department', employee.affectation],
            ['Marital Status', employee.situationFamiliale],
            ['CIN', employee.cin],
            ['PPR', employee.ppr],
            ['Address', employee.adresse],
            ['Email', employee.email],
            ['Phone Number', employee.numeroTelephone],
          ].map(([label, value], i) => (
            <div className="col-md-6 mb-2" key={i}>
              <strong>{label}:</strong> {value || 'N/A'}
            </div>
          ))}
        </div>
      </section>
      <section className="mb-4">
        <h5 className="mb-3 text-primary">Education & Activity</h5>
        <div className="row">
          {[
            ['Initial Education', employee.formationInitiale],
            ['Main Activity', employee.activitePrincipale],
            ['External Experience', employee.experienceExterne],
            ['Internal Experience', employee.experienceInterne],
            ['Contract Type', employee.typeContrat],
          ].map(([label, value], i) => (
            <div className="col-md-6 mb-2" key={i}>
              <strong>{label}:</strong> {value || 'N/A'}
            </div>
          ))}
        </div>
      </section>
      {infosSupplementaires.length > 0 && (
        <section className="mb-4">
          <h5 className="mb-3 text-primary">Supplementary Information</h5>
          <ul className="list-unstyled">
            {infosSupplementaires.map((info, idx) => (
              <li key={idx} className="mb-3">
                <div onClick={() => setSelectedInfo(selectedInfo === idx ? null : idx)} style={{ cursor: 'pointer' }}>
                  <strong>{info.titre}</strong>
                </div>
                {selectedInfo === idx && (
                  <div className="ps-3">
                    <p>{info.description}</p>
                    <FontAwesomeIcon icon={faEdit} className="me-2 text-primary" style={{ cursor: 'pointer' }} onClick={() => handleEdit(idx)} />
                    <FontAwesomeIcon icon={faTrash} className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDeleteInfo(idx)} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Information</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddInfo}>
          <Modal.Body>
            {error && <p className="text-danger">{error}</p>}
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newInfoTitre}
                onChange={(e) => setNewInfoTitre(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newInfoDesc}
                onChange={(e) => setNewInfoDesc(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Modal show={editModalOpen} onHide={() => setEditModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Information</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body>
            {error && <p className="text-danger">{error}</p>}
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editInfoTitre}
                onChange={(e) => setEditInfoTitre(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editInfoDesc}
                onChange={(e) => setEditInfoDesc(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}