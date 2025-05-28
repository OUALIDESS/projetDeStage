import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Alert, Dropdown, ButtonGroup, Card } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsPlus, BsDownload, BsEye, BsPencil, BsTrash, BsSortAlphaDown, BsSortAlphaUp, BsFilter, BsX } from 'react-icons/bs';

const PageEmployes = ({ theme = 'light', addNotification }) => {
  const [employes, setEmployes] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [afficherModal, setAfficherModal] = useState(false);
  const [afficherModalDetails, setAfficherModalDetails] = useState(false);
  const [afficherCarteSuppression, setAfficherCarteSuppression] = useState(false);
  const [idSuppression, setIdSuppression] = useState(null);
  const [employeActuel, setEmployeActuel] = useState(null);
  const [donneesFormulaire, setDonneesFormulaire] = useState({
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
    divisionId: '',
    informationsSupplementaires: '',
  });
  const [erreur, setErreur] = useState('');
  const [filtres, setFiltres] = useState({ nomComplet: '', ppr: '', affectation: '', divisionId: '' });
  const [pageActuelle, setPageActuelle] = useState(1);
  const [employesParPage] = useState(5);
  const [triAscendant, setTriAscendant] = useState(true);
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/');
    recupererDivisions();
    recupererEmployes();
  }, [navigate]);

  const recupererDivisions = async () => {
    try {
      const token = localStorage.getItem('token');
      const reponse = await axios.get('http://localhost:5000/api/divisions', { headers: { Authorization: `Bearer ${token}` } });
      setDivisions(reponse.data);
    } catch (err) {
      setErreur('Échec de la récupération des divisions : ' + (err.response?.data?.message || err.message));
      setTimeout(recupererDivisions, 2000);
    }
  };

  const recupererEmployes = async () => {
    try {
      const token = localStorage.getItem('token');
      const reponse = await axios.get('http://localhost:5000/api/employees', { headers: { Authorization: `Bearer ${token}` } });
      setEmployes(reponse.data);
    } catch (err) {
      setErreur('Échec de la récupération des employés : ' + (err.response?.data?.message || err.message));
    }
  };

  const gererChangementInput = (e) => setDonneesFormulaire({ ...donneesFormulaire, [e.target.name]: e.target.value });

  const gererChangementFiltre = (e) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value });
    setPageActuelle(1);
  };

  const ouvrirModal = (employe = null) => {
    setEmployeActuel(employe);
    setDonneesFormulaire(employe ? {
      nomComplet: employe.nomComplet || '',
      dateNaissance: employe.dateNaissance ? new Date(employe.dateNaissance).toISOString().split('T')[0] : '',
      sexe: employe.sexe || '',
      grade: employe.grade || '',
      dateRecrutement: employe.dateRecrutement ? new Date(employe.dateRecrutement).toISOString().split('T')[0] : '',
      diplome: employe.diplome || '',
      affectation: employe.affectation || '',
      situationFamiliale: employe.situationFamiliale || '',
      missionPoste: employe.missionPoste || '',
      formationInitiale: employe.formationInitiale || '',
      activitePrincipale: employe.activitePrincipale || '',
      cin: employe.cin || '',
      ppr: employe.ppr || '',
      adresse: employe.adresse || '',
      email: employe.email || '',
      numeroTelephone: employe.numeroTelephone || '',
      experienceExterne: employe.experienceExterne || '',
      experienceInterne: employe.experienceInterne || '',
      divisionId: employe.divisionId?._id || '',
      informationsSupplementaires: employe.informationsSupplementaires?.join(', ') || '',
    } : {
      nomComplet: '', dateNaissance: '', sexe: '', grade: '', dateRecrutement: '', diplome: '', affectation: '',
      situationFamiliale: '', missionPoste: '', formationInitiale: '', activitePrincipale: '', cin: '', ppr: '',
      adresse: '', email: '', numeroTelephone: '', experienceExterne: '', experienceInterne: '', divisionId: '',
      informationsSupplementaires: '',
    });
    setAfficherModal(true);
  };

  const gererAfficherDetails = (employe) => {
    setEmployeActuel(employe);
    setAfficherModalDetails(true);
  };

  const navigateToDetails = (employeId) => {
    navigate(`/employee-details/${employeId}`);
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    if (!donneesFormulaire.nomComplet.trim()) {
      setErreur('Le nom complet est requis');
      return;
    }
    if (!donneesFormulaire.email.trim()) {
      setErreur("L'email est requis");
      return;
    }
    if (!donneesFormulaire.divisionId) {
      setErreur('La division est requise');
      return;
    }
    if (!donneesFormulaire.sexe) {
      setErreur('Le genre est requis');
      return;
    }
    if (!donneesFormulaire.dateRecrutement) {
      setErreur('La date de recrutement est requise');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...donneesFormulaire,
        dateNaissance: donneesFormulaire.dateNaissance ? new Date(donneesFormulaire.dateNaissance) : undefined,
        dateRecrutement: donneesFormulaire.dateRecrutement ? new Date(donneesFormulaire.dateRecrutement) : undefined,
        informationsSupplementaires: donneesFormulaire.informationsSupplementaires
          ? donneesFormulaire.informationsSupplementaires.split(',').map((item) => item.trim())
          : [],
      };
      if (employeActuel) {
        const changes = {};
        const fields = [
          'nomComplet', 'dateNaissance', 'sexe', 'grade', 'dateRecrutement', 'diplome', 'affectation',
          'situationFamiliale', 'missionPoste', 'formationInitiale', 'activitePrincipale', 'cin', 'ppr',
          'adresse', 'email', 'numeroTelephone', 'experienceExterne', 'experienceInterne', 'divisionId'
        ];
        fields.forEach((field) => {
          const oldValue = employeActuel[field] || (field === 'divisionId' ? employeActuel.divisionId?.name : '');
          const newValue = payload[field] || (field === 'divisionId' ? divisions.find(d => d._id === payload.divisionId)?.name : '');
          if (oldValue !== newValue) {
            changes[field] = { old: oldValue, new: newValue };
          }
        });
        await axios.put(`http://localhost:5000/api/employees/${employeActuel._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        addNotification('modify', { nomComplet: employeActuel.nomComplet, changes });
        setBanners((prev) => [
          ...prev,
          { id: Date.now(), message: `Employé ${employeActuel.nomComplet} modifié` },
        ]);
      } else {
        await axios.post('http://localhost:5000/api/employees', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        addNotification('add', { nomComplet: donneesFormulaire.nomComplet });
        setBanners((prev) => [
          ...prev,
          { id: Date.now(), message: `Employé ${donneesFormulaire.nomComplet} ajouté avec succès` },
        ]);
      }
      setAfficherModal(false);
      setErreur('');
      recupererEmployes();
    } catch (err) {
      setErreur(`Échec de la ${employeActuel ? 'mise à jour' : 'création'} de l'employé : ${err.response?.data?.message || err.message}`);
    }
  };

  const gererSuppression = (e, id) => {
    e.stopPropagation();
    setAfficherCarteSuppression(true);
    setIdSuppression(id);
  };

  const confirmerSuppression = async () => {
    try {
      const token = localStorage.getItem('token');
      const employe = employes.find((emp) => emp._id === idSuppression);
      await axios.delete(`http://localhost:5000/api/employees/${idSuppression}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      addNotification('delete', { nomComplet: employe.nomComplet });
      setBanners((prev) => [
        ...prev,
        { id: Date.now(), message: `Employé ${employe.nomComplet} supprimé avec succès` },
      ]);
      recupererEmployes();
      setAfficherCarteSuppression(false);
    } catch (err) {
      setErreur('Échec de la suppression de l\'employé : ' + (err.response?.data?.message || err.message));
      setAfficherCarteSuppression(false);
    }
  };

  const annulerSuppression = () => setAfficherCarteSuppression(false);

  const exporterVersExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const reponse = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tousEmployes = reponse.data;
      const ws = XLSX.utils.json_to_sheet(
        tousEmployes.map((emp) => ({
          'Nom Complet': emp.nomComplet || '',
          CIN: emp.cin || '',
          PPR: emp.ppr || '',
          'Date de Naissance': emp.dateNaissance || '',
          Genre: emp.sexe || '',
          Grade: emp.grade || '',
          'Date de Recrutement': emp.dateRecrutement || '',
          Diplôme: emp.diplome || '',
          Affectation: emp.affectation || '',
          'Situation Familiale': emp.situationFamiliale || '',
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Employés');
      XLSX.writeFile(wb, 'tous_employes.xlsx');
    } catch (err) {
      setErreur('Échec de l\'exportation vers Excel : ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setTimeout(() => {
        setBanners((prev) => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [banners]);

  const employesFiltres = employes.filter((emp) =>
    (emp.nomComplet || '').toLowerCase().includes(filtres.nomComplet.toLowerCase()) &&
    (emp.ppr || '').toLowerCase().includes(filtres.ppr.toLowerCase()) &&
    (emp.affectation || '').toLowerCase().includes(filtres.affectation.toLowerCase()) &&
    (emp.divisionId?.name || '').toLowerCase().includes(filtres.divisionId.toLowerCase())
  );

  const employesTries = [...employesFiltres].sort((a, b) =>
    triAscendant ? a.nomComplet.localeCompare(b.nomComplet) : b.nomComplet.localeCompare(a.nomComplet)
  );

  const indexDernierEmploye = pageActuelle * employesParPage;
  const indexPremierEmploye = indexDernierEmploye - employesParPage;
  const employesActuels = employesTries.slice(indexPremierEmploye, indexDernierEmploye);
  const totalPages = Math.ceil(employesTries.length / employesParPage);

  const paginer = (pageNumber) => setPageActuelle(pageNumber);
  const basculerTri = (asc) => setTriAscendant(asc);

  const nomEmployeASupprimer = employes.find((emp) => emp._id === idSuppression)?.nomComplet || 'Inconnu';

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
            background-color: #34495e !important;
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
          }

          .table-custom thead {
            background-color: #34495e !important;
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
          }

          .table-custom tbody tr:hover {
            background-color: ${theme === 'dark' ? 'rgba(52, 73, 94, 0.8)' : 'rgba(52, 73, 94, 0.2)'};
          }

          .table-custom tbody tr {
            background-color: transparent;
            cursor: pointer;
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
            background-color: #1e40af;
            border: none;
            color: #ffffff;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
          }

          .btn-primary:hover {
            background-color: #163373;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            color: #ffffff;
          }

          .btn-exporter {
            background-color: #28a745;
            border: none;
            color: #ffffff;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
          }

          .btn-exporter:hover {
            background-color: #218838;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            color: #ffffff;
          }

          .btn-outline-secondary {
            color: ${theme === 'dark' ? '#a0a0a0' : '#6c757d'};
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#ced4da'};
          }

          .btn-outline-secondary:hover {
            background-color: ${theme === 'dark' ? '#3a3a4a' : '#e9ecef'};
            color: ${theme === 'dark' ? '#e0e0e0' : '#495057'};
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

          .table-custom .btn-link {
            color: ${theme === 'dark' ? '#ffffff' : '#1e40af'};
          }

          .table-custom .btn-link.text-danger {
            color: ${theme === 'dark' ? '#dc3545' : '#dc3545'} !important;
          }

          .btn.pagination-btn {
            background-color: ${theme === 'dark' ? '#ffffff' : '#1e40af'};
            border-color: ${theme === 'dark' ? '#ffffff' : '#1e40af'};
            color: ${theme === 'dark' ? '#14131f' : '#ffffff'};
          }

          .btn.pagination-btn:hover {
            background-color: ${theme === 'dark' ? '#e0e0e0' : '#163373'};
            border-color: ${theme === 'dark' ? '#e0e0e0' : '#163373'};
            color: ${theme === 'dark' ? '#14131f' : '#ffffff'};
          }

          .btn.pagination-btn:disabled {
            background-color: ${theme === 'dark' ? '#a0a0a0' : '#6c757d'};
            border-color: ${theme === 'dark' ? '#a0a0a0' : '#6c757d'};
            color: ${theme === 'dark' ? '#14131f' : '#ffffff'};
            opacity: 0.65;
          }
        `}
      </style>
      <div className="app-container">
        <div className="card-custom">
          {erreur && <Alert variant="danger" className="mb-4">{erreur}</Alert>}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">Gestion des Employés</h3>
            <div className="d-flex gap-2">
              <Button variant="exporter" onClick={exporterVersExcel}>
                <BsDownload className="me-2" /> Exporter
              </Button>
              <Button variant="primary" onClick={() => ouvrirModal()}>
                <BsPlus size={20} className="me-2" /> Ajouter
              </Button>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
            <Form.Control
              type="text"
              name="nomComplet"
              placeholder="Rechercher par nom..."
              value={filtres.nomComplet}
              onChange={gererChangementFiltre}
              className="flex-grow-1"
            />
            <ButtonGroup>
              <Button variant={triAscendant ? 'primary' : 'outline-secondary'} onClick={() => basculerTri(true)}>
                <BsSortAlphaDown />
              </Button>
              <Button variant={!triAscendant ? 'primary' : 'outline-secondary'} onClick={() => basculerTri(false)}>
                <BsSortAlphaUp />
              </Button>
            </ButtonGroup>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary">
                <BsFilter className="me-2" /> Divisions
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {divisions.map((division) => (
                  <Dropdown.Item
                    key={division._id}
                    active={filtres.divisionId === division.name.toLowerCase()}
                    onClick={() => setFiltres({ ...filtres, divisionId: division.name.toLowerCase() })}
                  >
                    {division.name}
                  </Dropdown.Item>
                ))}
                <Dropdown.Item onClick={() => setFiltres({ ...filtres, divisionId: '' })}>
                  Effacer les filtres
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {filtres.divisionId && (
            <div className="mb-4">
              <small className="text-muted">
                Filtre actif: {divisions.find((d) => d.name.toLowerCase() === filtres.divisionId)?.name}
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger p-0 ms-2"
                  onClick={() => setFiltres({ ...filtres, divisionId: '' })}
                >
                  Effacer
                </Button>
              </small>
            </div>
          )}

          <div className="table-container">
            <Table className="table-custom">
              <thead>
                <tr>
                  <th>Nom Complet</th>
                  <th>CIN</th>
                  <th>PPR</th>
                  <th>Date de Naissance</th>
                  <th>Genre</th>
                  <th>Grade</th>
                  <th>Date de Recrutement</th>
                  <th>Diplôme</th>
                  <th>Affectation</th>
                  <th>Situation Familiale</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employesActuels.length > 0 ? (
                  employesActuels.map((employe) => (
                    <tr key={employe._id} onClick={() => navigateToDetails(employe._id)}>
                      <td>{employe.nomComplet || ''}</td>
                      <td>{employe.cin || ''}</td>
                      <td>{employe.ppr || ''}</td>
                      <td>{employe.dateNaissance ? new Date(employe.dateNaissance).toLocaleDateString('fr-FR') : ''}</td>
                      <td>{employe.sexe || ''}</td>
                      <td>{employe.grade || ''}</td>
                      <td>{employe.dateRecrutement ? new Date(employe.dateRecrutement).toLocaleDateString('fr-FR') : ''}</td>
                      <td>{employe.diplome || ''}</td>
                      <td>{employe.affectation || ''}</td>
                      <td>{employe.situationFamiliale || ''}</td>
                      <td className="text-center">
                        <Button variant="link" onClick={(e) => { e.stopPropagation(); gererAfficherDetails(employe); }} className="text-muted">
                          <BsEye />
                        </Button>
                        <Button variant="link" onClick={(e) => { e.stopPropagation(); ouvrirModal(employe); }} className="text-muted">
                          <BsPencil />
                        </Button>
                        <Button variant="link" onClick={(e) => gererSuppression(e, employe._id)} className="text-danger">
                          <BsTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center text-muted py-4">
                      Aucun employé trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <Button
              onClick={() => paginer(pageActuelle - 1)}
              disabled={pageActuelle === 1}
              variant="pagination-btn"
              className="me-2"
            >
              Précédent
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                onClick={() => paginer(i + 1)}
                variant="pagination-btn"
                className="me-2"
                active={pageActuelle === i + 1}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              onClick={() => paginer(pageActuelle + 1)}
              disabled={pageActuelle === totalPages}
              variant="pagination-btn"
            >
              Suivant
            </Button>
          </div>

          {banners.map((banner) => (
            <div key={banner.id} className="banner">
              {banner.message}
            </div>
          ))}

          <Modal show={afficherModal} onHide={() => setAfficherModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>{employeActuel ? 'Modifier Employé' : 'Ajouter Employé'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={gererSoumission} className="d-flex flex-wrap justify-content-center gap-3">
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Nom Complet</Form.Label>
                  <Form.Control
                    type="text"
                    name="nomComplet"
                    value={donneesFormulaire.nomComplet}
                    onChange={gererChangementInput}
                    required
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Date de Naissance</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateNaissance"
                    value={donneesFormulaire.dateNaissance}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Genre</Form.Label>
                  <Form.Select
                    name="sexe"
                    value={donneesFormulaire.sexe}
                    onChange={gererChangementInput}
                    required
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  >
                    <option value="">Sélectionner Genre</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Grade</Form.Label>
                  <Form.Control
                    type="text"
                    name="grade"
                    value={donneesFormulaire.grade}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Date de Recrutement</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateRecrutement"
                    value={donneesFormulaire.dateRecrutement}
                    onChange={gererChangementInput}
                    required
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Diplôme</Form.Label>
                  <Form.Control
                    type="text"
                    name="diplome"
                    value={donneesFormulaire.diplome}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Affectation</Form.Label>
                  <Form.Control
                    type="text"
                    name="affectation"
                    value={donneesFormulaire.affectation}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Situation Familiale</Form.Label>
                  <Form.Select
                    name="situationFamiliale"
                    value={donneesFormulaire.situationFamiliale}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  >
                    <option value="">Sélectionner Statut</option>
                    <option value="Célibataire">Célibataire</option>
                    <option value="Marié">Marié</option>
                    <option value="Divorcé">Divorcé</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Mission</Form.Label>
                  <Form.Control
                    type="text"
                    name="missionPoste"
                    value={donneesFormulaire.missionPoste}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Division</Form.Label>
                  <Form.Select
                    name="divisionId"
                    value={donneesFormulaire.divisionId}
                    onChange={gererChangementInput}
                    required
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  >
                    <option value="">Sélectionner Division</option>
                    {divisions.map((division) => (
                      <option key={division._id} value={division._id}>
                        {division.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Formation Initiale</Form.Label>
                  <Form.Control
                    type="text"
                    name="formationInitiale"
                    value={donneesFormulaire.formationInitiale}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Activité Principale</Form.Label>
                  <Form.Control
                    type="text"
                    name="activitePrincipale"
                    value={donneesFormulaire.activitePrincipale}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">CIN</Form.Label>
                  <Form.Control
                    type="text"
                    name="cin"
                    value={donneesFormulaire.cin}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">PPR</Form.Label>
                  <Form.Control
                    type="text"
                    name="ppr"
                    value={donneesFormulaire.ppr}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Adresse</Form.Label>
                  <Form.Control
                    type="text"
                    name="adresse"
                    value={donneesFormulaire.adresse}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={donneesFormulaire.email}
                    onChange={gererChangementInput}
                    required
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Numéro de Téléphone</Form.Label>
                  <Form.Control
                    type="text"
                    name="numeroTelephone"
                    value={donneesFormulaire.numeroTelephone}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Expérience Externe</Form.Label>
                  <Form.Control
                    type="text"
                    name="experienceExterne"
                    value={donneesFormulaire.experienceExterne}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Expérience Interne</Form.Label>
                  <Form.Control
                    type="text"
                    name="experienceInterne"
                    value={donneesFormulaire.experienceInterne}
                    onChange={gererChangementInput}
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Form.Group className="form-group-compact" style={{ flex: '1 1 48%', minWidth: '200px' }}>
                  <Form.Label className="form-label-compact">Informations Supplémentaires</Form.Label>
                  <Form.Control
                    type="text"
                    name="informationsSupplementaires"
                    value={donneesFormulaire.informationsSupplementaires}
                    onChange={gererChangementInput}
                    placeholder="Séparez par des virgules"
                    className="form-control-compact"
                    style={{ borderRadius: '0.3rem' }}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3 w-100" style={{ borderRadius: '0.3rem' }}>
                  Enregistrer
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          <Modal show={afficherModalDetails} onHide={() => setAfficherModalDetails(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Détails de l'Employé</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4">
              {employeActuel && (
                <div className="row g-3">
                  <div className="col-12 col-md-6"><strong>Nom Complet :</strong> {employeActuel.nomComplet || ''}</div>
                  <div className="col-12 col-md-6"><strong>Date de Naissance :</strong> {employeActuel.dateNaissance ? new Date(employeActuel.dateNaissance).toLocaleDateString('fr-FR') : ''}</div>
                  <div className="col-12 col-md-6"><strong>Genre :</strong> {employeActuel.sexe || ''}</div>
                  <div className="col-12 col-md-6"><strong>Grade :</strong> {employeActuel.grade || ''}</div>
                  <div className="col-12 col-md-6"><strong>Date de Recrutement :</strong> {employeActuel.dateRecrutement ? new Date(employeActuel.dateRecrutement).toLocaleDateString('fr-FR') : ''}</div>
                  <div className="col-12 col-md-6"><strong>Diplôme :</strong> {employeActuel.diplome || ''}</div>
                  <div className="col-12 col-md-6"><strong>Affectation :</strong> {employeActuel.affectation || ''}</div>
                  <div className="col-12 col-md-6"><strong>Situation Familiale :</strong> {employeActuel.situationFamiliale || ''}</div>
                  <div className="col-12 col-md-6"><strong>Mission :</strong> {employeActuel.missionPoste || ''}</div>
                  <div className="col-12 col-md-6"><strong>Division :</strong> {employeActuel.divisionId?.name || 'Inconnue'}</div>
                  <div className="col-12 col-md-6"><strong>Formation Initiale :</strong> {employeActuel.formationInitiale || ''}</div>
                  <div className="col-12 col-md-6"><strong>Activité Principale :</strong> {employeActuel.activitePrincipale || ''}</div>
                  <div className="col-12 col-md-6"><strong>CIN :</strong> {employeActuel.cin || ''}</div>
                  <div className="col-12 col-md-6"><strong>PPR :</strong> {employeActuel.ppr || ''}</div>
                  <div className="col-12 col-md-6"><strong>Adresse :</strong> {employeActuel.adresse || ''}</div>
                  <div className="col-12 col-md-6"><strong>Email :</strong> {employeActuel.email || ''}</div>
                  <div className="col-12 col-md-6"><strong>Numéro de Téléphone :</strong> {employeActuel.numeroTelephone || ''}</div>
                  <div className="col-12 col-md-6"><strong>Expérience Externe :</strong> {employeActuel.experienceExterne || ''}</div>
                  <div className="col-12 col-md-6"><strong>Expérience Interne :</strong> {employeActuel.experienceInterne || ''}</div>
                  <div className="col-12 col-md-6"><strong>Informations Supplémentaires :</strong> {employeActuel.informationsSupplementaires?.join(', ') || ''}</div>
                </div>
              )}
            </Modal.Body>
          </Modal>

          {afficherCarteSuppression && (
            <div className="position-fixed top-0 start-0 w-100 h-100 backdrop-custom" style={{ zIndex: 1050 }}>
              <Card className="position-absolute top-50 start-50 translate-middle delete-card" style={{ width: '20rem' }}>
                <Card.Body>
                  <Card.Title>Confirmer la Suppression</Card.Title>
                  <Card.Text>Êtes-vous sûr de vouloir supprimer l'employé <strong>{nomEmployeASupprimer}</strong> ?</Card.Text>
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <Button variant="danger" onClick={confirmerSuppression} style={{ width: '80px' }}>
                      Oui
                    </Button>
                    <Button variant="outline-light" onClick={annulerSuppression} style={{ width: '80px' }}>
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

export default PageEmployes;