import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button, Modal, Form, Card } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function EmployeeDetails({ theme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [employee, setEmployee] = useState(null);
  const [infosSupplementaires, setInfosSupplementaires] = useState([]);
  const [iconVisibility, setIconVisibility] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newInfoTitre, setNewInfoTitre] = useState("");
  const [newInfoDesc, setNewInfoDesc] = useState("");
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const passedEmployee = location.state?.employee;
    console.log('Employee data received from PageEmployes:', passedEmployee);

    if (passedEmployee) {
      setEmployee(passedEmployee);
      const supplementaryInfo = passedEmployee.supplementaryInfo || passedEmployee.informationsSupplementaires || [];
      setInfosSupplementaires(supplementaryInfo);
      setIconVisibility(new Array(supplementaryInfo.length).fill(false));
      setLoading(false);
    } else {
      setError('Aucune donnée d’employé trouvée. Veuillez retourner à la liste des employés.');
      setTimeout(() => navigate('/pages/Employees'), 3000);
      setLoading(false);
    }
  }, [location.state, navigate]);

  const handleAddInfo = (e) => {
    e.preventDefault();
    if (!newInfoTitre.trim() || !newInfoDesc.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    const newInfo = { titre: newInfoTitre, description: newInfoDesc };
    setInfosSupplementaires([...infosSupplementaires, newInfo]);
    setIconVisibility([...iconVisibility, false]);
    setModalOpen(false);
    setNewInfoTitre("");
    setNewInfoDesc("");
    setError('');
  };

  const handleEditInfo = (info) => {
    setSelectedInfo(info);
    setNewInfoTitre(info.titre);
    setNewInfoDesc(info.description || '');
    setModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!newInfoTitre.trim() || !newInfoDesc.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    const updatedInfos = infosSupplementaires.map(info =>
      info === selectedInfo ? { titre: newInfoTitre, description: newInfoDesc } : info
    );
    setInfosSupplementaires(updatedInfos);
    setModalOpen(false);
    setSelectedInfo(null);
    setNewInfoTitre("");
    setNewInfoDesc("");
    setError('');
  };

  const handleDeleteConfirm = (info) => {
    setSelectedInfo(info);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const index = infosSupplementaires.indexOf(selectedInfo);
    const updatedInfos = infosSupplementaires.filter(info => info !== selectedInfo);
    setInfosSupplementaires(updatedInfos);
    setIconVisibility(iconVisibility.filter((_, i) => i !== index));
    setShowDeleteConfirm(false);
    setSelectedInfo(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedInfo(null);
  };

  const toggleIconVisibility = (index) => {
    const updatedVisibility = [...iconVisibility];
    updatedVisibility[index] = !updatedVisibility[index];
    setIconVisibility(updatedVisibility);
  };

  const handleExportPDF = async () => {
    const element = document.createElement("div");
    element.style.width = "1200px";
    element.style.padding = "20px";
    element.style.backgroundColor = theme === 'dark' ? '#2a2a3a' : '#ffffff';
    element.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
    const original = document.querySelector(".container.my-5.shadow.p-4.rounded").cloneNode(true);
    original.querySelectorAll("button, .btn, .fa-edit, .fa-trash").forEach(el => el.remove());
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
      setError('Échec de la génération du PDF.');
    } finally {
      document.body.removeChild(element);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem', color: theme === 'dark' ? '#e0e0e0' : '#212529' }}>Chargement...</p>;
  if (error) return (
    <div style={{ textAlign: 'center', marginTop: '2rem', color: theme === 'dark' ? '#e0e0e0' : '#212529' }}>
      <p style={{ color: theme === 'dark' ? '#f9a8a8' : '#721c24' }}>{error}</p>
      <p>Vous serez redirigé vers la liste des employés...</p>
    </div>
  );
  if (!employee) return <p style={{ textAlign: 'center', marginTop: '2rem', color: theme === 'dark' ? '#e0e0e0' : '#212529' }}>Employé non trouvé.</p>;

  const imagePath = employee.image 
    ? (employee.image.startsWith('http') || employee.image.startsWith('data:image/')) 
      ? employee.image 
      : employee.image
    : 'https://via.placeholder.com/150?text=No+Image';

  const containerStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    border: `1px solid ${theme === 'dark' ? '#3a3a4a' : '#dee2e6'}`,
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '1200px',
    margin: '2rem auto',
  };

  const btnOutlineStyle = {
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    borderColor: theme === 'dark' ? '#4a4a5a' : '#ced4da',
    backgroundColor: 'transparent',
    padding: '0.3rem 0.6rem',
    transition: 'background-color 0.3s ease',
  };

  const textPrimaryStyle = {
    color: theme === 'dark' ? '#a0a0ff' : '#007bff',
  };

  const modalContentStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#3a3a4a' : '#dee2e6'}`,
    borderRadius: '10px',
    padding: '1rem',
  };

  const modalHeaderStyle = {
    backgroundColor: theme === 'dark' ? '#3a3a4a' : '#f8f9fa',
    borderColor: theme === 'dark' ? '#4a4a5a' : '#dee2e6',
  };

  const formControlStyle = {
    backgroundColor: theme === 'dark' ? '#3a3a4a' : '#ffffff',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    borderColor: theme === 'dark' ? '#4a4a5a' : '#ced4da',
    padding: '0.3rem 0.5rem',
    fontSize: '0.9rem',
  };

  const deleteCardStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    border: `1px solid ${theme === 'dark' ? '#3a3a4a' : '#dee2e6'}`,
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className="container my-5 shadow p-4 rounded" style={containerStyle}>
      {error && <p style={{ color: theme === 'dark' ? '#f9a8a8' : '#721c24' }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <Link to="/pages/Employees" style={{ ...btnOutlineStyle, textDecoration: 'none' }}>
          ← Retour
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline-secondary" size="sm" onClick={handleExportPDF} style={btnOutlineStyle}>
            Exporter PDF
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={() => { setSelectedInfo(null); setModalOpen(true); }} style={btnOutlineStyle}>
            Ajouter Info
          </Button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <img src={imagePath} alt={`${employee.nomComplet}'s photo`} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', marginRight: '1rem' }} />
        <div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{employee.nomComplet}</h2>
          <p style={{ color: theme === 'dark' ? '#a0a0a0' : '#6c757d', marginBottom: 0 }}>{employee.missionPoste} - {employee.grade}</p>
        </div>
      </div>
      <hr style={{ borderColor: theme === 'dark' ? '#4a4a5a' : '#dee2e6' }} />
      <section style={{ marginBottom: '1rem' }}>
        <h5 style={{ ...textPrimaryStyle, marginBottom: '0.75rem' }}>Informations Personnelles</h5>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            ['Date de Naissance', employee.dateNaissance ? new Date(employee.dateNaissance).toLocaleDateString('fr-FR') : 'N/A'],
            ['Genre', employee.sexe],
            ['Grade', employee.grade],
            ['Date de Recrutement', employee.dateRecrutement ? new Date(employee.dateRecrutement).toLocaleDateString('fr-FR') : 'N/A'],
            ['Diplôme', employee.diplome],
            ['Division', employee.divisionId?.name || 'N/A'],
            ['Affectation', employee.affectation],
            ['Situation Familiale', employee.situationFamiliale],
            ['CIN', employee.cin],
            ['PPR', employee.ppr],
            ['Adresse', employee.adresse],
            ['Email', employee.email],
            ['Numéro de Téléphone', employee.numeroTelephone],
            ['Ancienneté (ans)', employee.anciennete || 'N/A'],
          ].map(([label, value], i) => (
            <div key={i} style={{ flex: '1 1 48%', minWidth: '200px', marginBottom: '0.5rem' }}>
              <strong>{label}:</strong> {value || 'N/A'}
            </div>
          ))}
        </div>
      </section>
      <section style={{ marginBottom: '1rem' }}>
        <h5 style={{ ...textPrimaryStyle, marginBottom: '0.75rem' }}>Éducation & Activité</h5>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            ['Formation Initiale', employee.formationInitiale],
            ['Activité Principale', employee.activitePrincipale],
            ['Expérience Externe', employee.experienceExterne],
            ['Expérience Interne', employee.experienceInterne],
          ].map(([label, value], i) => (
            <div key={i} style={{ flex: '1 1 48%', minWidth: '200px', marginBottom: '0.5rem' }}>
              <strong>{label}:</strong> {value || 'N/A'}
            </div>
          ))}
        </div>
      </section>
      {infosSupplementaires.length > 0 && (
        <section style={{ marginBottom: '1rem' }}>
          <h5 style={{ ...textPrimaryStyle, marginBottom: '0.75rem' }}>Informations Supplémentaires</h5>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {infosSupplementaires.map((info, idx) => (
              <li
                key={idx}
                style={{ marginBottom: '0.75rem', position: 'relative', cursor: 'pointer' }}
                onClick={() => toggleIconVisibility(idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <strong>{info.titre || info}</strong>
                    <div style={{ paddingLeft: '1rem' }}>
                      <p>{info.description || ''}</p>
                    </div>
                  </div>
                  {iconVisibility[idx] && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <FaEdit
                        style={{ cursor: 'pointer', color: theme === 'dark' ? '#a0a0ff' : '#007bff' }}
                        onClick={(e) => { e.stopPropagation(); handleEditInfo(info); }}
                      />
                      <FaTrash
                        style={{ cursor: 'pointer', color: theme === 'dark' ? '#f9a8a8' : '#dc3545' }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(info); }}
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Modal show={modalOpen} onHide={() => { setModalOpen(false); setSelectedInfo(null); setNewInfoTitre(""); setNewInfoDesc(""); }} centered>
        <div style={modalContentStyle}>
          <Modal.Header closeButton style={modalHeaderStyle}>
            <Modal.Title>{selectedInfo ? 'Modifier Information' : 'Ajouter Information'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={selectedInfo ? handleSaveEdit : handleAddInfo}>
            <Modal.Body style={{ padding: '1rem' }}>
              {error && <p style={{ color: theme === 'dark' ? '#f9a8a8' : '#721c24' }}>{error}</p>}
              <Form.Group style={{ marginBottom: '0.5rem' }}>
                <Form.Label style={{ marginBottom: '0.2rem', fontSize: '0.9rem' }}>Titre</Form.Label>
                <Form.Control
                  type="text"
                  value={newInfoTitre}
                  onChange={(e) => setNewInfoTitre(e.target.value)}
                  required
                  style={formControlStyle}
                />
              </Form.Group>
              <Form.Group style={{ marginBottom: '0.5rem' }}>
                <Form.Label style={{ marginBottom: '0.2rem', fontSize: '0.9rem' }}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newInfoDesc}
                  onChange={(e) => setNewInfoDesc(e.target.value)}
                  required
                  style={formControlStyle}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer style={{ borderColor: theme === 'dark' ? '#4a4a5a' : '#dee2e6' }}>
              <Button variant="outline-secondary" onClick={() => { setModalOpen(false); setSelectedInfo(null); setNewInfoTitre(""); setNewInfoDesc(""); }} style={btnOutlineStyle}>
                Annuler
              </Button>
              <Button variant="primary" type="submit" style={{ backgroundColor: theme === 'dark' ? '#a0a0ff' : '#007bff', borderColor: theme === 'dark' ? '#a0a0ff' : '#007bff' }}>
                {selectedInfo ? 'Modifier' : 'Ajouter'}
              </Button>
            </Modal.Footer>
          </Form>
        </div>
      </Modal>
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: theme === 'dark' ? 'rgba(20, 19, 31, 0.8)' : 'rgba(0, 0, 0, 0.5)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Card style={{ ...deleteCardStyle, width: '20rem' }}>
            <Card.Body>
              <Card.Title>Confirmer la suppression</Card.Title>
              <Card.Text>Êtes-vous sûr de vouloir supprimer cette information ?</Card.Text>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                <Button variant="danger" onClick={confirmDelete} style={{ backgroundColor: theme === 'dark' ? '#f9a8a8' : '#dc3545', borderColor: theme === 'dark' ? '#f9a8a8' : '#dc3545', color: '#fff' }}>
                  Oui
                </Button>
                <Button variant="secondary" onClick={cancelDelete} style={{ backgroundColor: theme === 'dark' ? '#4a4a5a' : '#6c757d', borderColor: theme === 'dark' ? '#4a4a5a' : '#6c757d', color: '#fff' }}>
                  Non
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}