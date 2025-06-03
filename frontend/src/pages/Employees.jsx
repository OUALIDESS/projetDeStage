import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Alert, Dropdown, ButtonGroup, Card } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsPlus, BsDownload, BsEye, BsPencil, BsTrash, BsSortAlphaDown, BsSortAlphaUp, BsFilter, BsX } from 'react-icons/bs';

const PageEmployes = ({ theme = 'light', addNotification, collapsed }) => {
  const [employes, setEmployes] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [afficherModal, setAfficherModal] = useState(false);
  const [afficherModalDetails, setAfficherModalDetails] = useState(false);
  const [afficherCarteSuppression, setAfficherCarteSuppression] = useState(false);
  const [idSuppression, setIdSuppression] = useState(null);
  const [employeActuel, setEmployeActuel] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [donneesFormulaire, setDonneesFormulaire] = useState({
    nomComplet: '', dateNaissance: '', sexe: '', grade: '', dateRecrutement: '',
    diplome: '', affectation: '', situationFamiliale: '', missionPoste: '',
    formationInitiale: '', activitePrincipale: '', cin: '', ppr: '', adresse: '',
    email: '', numeroTelephone: '', experienceExterne: '', experienceInterne: '',
    divisionId: '', informationsSupplementaires: '', image: '', anciennete: '',
  });
  const [erreur, setErreur] = useState('');
  const [filtres, setFiltres] = useState({ nomComplet: '', ppr: '', affectation: '', divisionId: '' });
  const [pageActuelle, setPageActuelle] = useState(1);
  const [employesParPage] = useState(5);
  const [triAscendant, setTriAscendant] = useState(true);
  const [banners, setBanners] = useState([]);
  const [showExportCard, setShowExportCard] = useState(false);
  const [retryCount, setRetryCount] = useState({ employes: 0, divisions: 0 });
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredTableRow, setHoveredTableRow] = useState(null);
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState(null);
  const [hoveredDeleteButton, setHoveredDeleteButton] = useState(false);
  const [hoveredCancelButton, setHoveredCancelButton] = useState(false);
  const [hoveredPaginationButton, setHoveredPaginationButton] = useState(null);
  const navigate = useNavigate();

  // Calculate available width based on sidebar state
  const sidebarWidth = collapsed ? 50 : 200;
  const [tableContainerWidth, setTableContainerWidth] = useState(window.innerWidth - sidebarWidth);

  useEffect(() => {
    const handleResize = () => {
      setTableContainerWidth(window.innerWidth - sidebarWidth);
    };

    // Update width when sidebar state changes or window resizes
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed, sidebarWidth]);

  const MAX_RETRIES = 3;

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/');
    recupererDivisions();
    recupererEmployes();
  }, [navigate]);

  const recupererDivisions = async () => {
    if (retryCount.divisions >= MAX_RETRIES) {
      setErreur('Échec de la récupération des divisions après plusieurs tentatives.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const reponse = await axios.get('http://localhost:5000/api/divisions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDivisions(reponse.data);
      setRetryCount((prev) => ({ ...prev, divisions: 0 }));
    } catch (err) {
      setErreur('Échec de la récupération des divisions : ' + (err.response?.data?.message || err.message));
      setRetryCount((prev) => ({ ...prev, divisions: prev.divisions + 1 }));
      setTimeout(recupererDivisions, 2000);
    }
  };

  const recupererEmployes = async () => {
    if (retryCount.employes >= MAX_RETRIES) {
      setErreur('Échec de la récupération des employés après plusieurs tentatives.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const reponse = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployes(reponse.data);
      setRetryCount((prev) => ({ ...prev, employes: 0 }));
    } catch (err) {
      setErreur('Échec de la récupération des employés : ' + (err.response?.data?.message || err.message));
      setRetryCount((prev) => ({ ...prev, employes: prev.employes + 1 }));
      setTimeout(recupererEmployes, 2000);
    }
  };

  const calculateAnciennete = (dateRecrutement) => {
    if (!dateRecrutement || isNaN(new Date(dateRecrutement).getTime())) return 'N/A';
    const recruitmentDate = new Date(dateRecrutement);
    const currentDate = new Date();
    const diffTime = currentDate - recruitmentDate;
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
  };

  const formatDateSafely = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return '';
    return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const gererChangementInput = (e) => {
    const { name, value } = e.target;
    if (name === 'dateRecrutement') {
      const anciennete = calculateAnciennete(value);
      setDonneesFormulaire({ ...donneesFormulaire, [name]: value, anciennete: anciennete.toString() });
    } else {
      setDonneesFormulaire({ ...donneesFormulaire, [name]: value });
    }
  };

  const gererChangementFiltre = (e) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value });
    setPageActuelle(1);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image/jpeg')) {
        setErreur('Seuls les fichiers JPEG (.jpg ou .jpeg) sont autorisés.');
        return;
      }
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setErreur('La taille de l\'image doit être inférieure à 10 Mo.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setDonneesFormulaire({ ...donneesFormulaire, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const ouvrirModal = (employe = null) => {
    setEmployeActuel(employe);
    setImageFile(null);
    setImagePreview(null);
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
      image: employe.image || '',
      anciennete: calculateAnciennete(employe.dateRecrutement).toString(),
    } : {
      nomComplet: '', dateNaissance: '', sexe: '', grade: '', dateRecrutement: '',
      diplome: '', affectation: '', situationFamiliale: '', missionPoste: '',
      formationInitiale: '', activitePrincipale: '', cin: '', ppr: '', adresse: '',
      email: '', numeroTelephone: '', experienceExterne: '', experienceInterne: '',
      divisionId: '', informationsSupplementaires: '', image: '', anciennete: '',
    });
    setAfficherModal(true);
  };

  const fermerModal = () => {
    setAfficherModal(false);
    setEmployeActuel(null);
    setImageFile(null);
    setImagePreview(null);
    setDonneesFormulaire({
      nomComplet: '', dateNaissance: '', sexe: '', grade: '', dateRecrutement: '',
      diplome: '', affectation: '', situationFamiliale: '', missionPoste: '',
      formationInitiale: '', activitePrincipale: '', cin: '', ppr: '', adresse: '',
      email: '', numeroTelephone: '', experienceExterne: '', experienceInterne: '',
      divisionId: '', informationsSupplementaires: '', image: '', anciennete: '',
    });
  };

  const gererAfficherDetails = (employe) => {
    setEmployeActuel(employe);
    setAfficherModalDetails(true);
  };

  const navigateToDetails = (employeId) => {
    const employeeExists = employes.find(emp => emp._id === employeId);
    if (employeeExists) {
      navigate(`/pages/EmployeeDetails/${employeId}`, { state: { employee: employeeExists } });
    } else {
      setErreur('Employé non trouvé localement. Mise à jour de la liste...');
      recupererEmployes().then(() => {
        const updatedEmployee = employes.find(emp => emp._id === employeId);
        if (updatedEmployee) {
          navigate(`/pages/EmployeeDetails/${employeId}`, { state: { employee: updatedEmployee } });
        } else {
          setErreur('Employé non trouvé. Il a peut-être été supprimé ou l\'ID est invalide.');
        }
      });
    }
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
    if (!donneesFormulaire.divisionId || donneesFormulaire.divisionId === '') {
      setErreur('La division est requise');
      return;
    }
    if (!donneesFormulaire.sexe || donneesFormulaire.sexe === '') {
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
          ? donneesFormulaire.informationsSupplementaires.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
        image: donneesFormulaire.image || '',
        anciennete: calculateAnciennete(donneesFormulaire.dateRecrutement).toString(),
      };
      if (employeActuel) {
        const changes = {};
        const fields = [
          'nomComplet', 'dateNaissance', 'sexe', 'grade', 'dateRecrutement', 'diplome', 'affectation',
          'situationFamiliale', 'missionPoste', 'formationInitiale', 'activitePrincipale', 'cin', 'ppr',
          'adresse', 'email', 'numeroTelephone', 'experienceExterne', 'experienceInterne', 'divisionId',
          'image', 'anciennete'
        ];
        fields.forEach((field) => {
          let oldValue = employeActuel[field];
          let newValue = payload[field];
          if (field === 'divisionId') {
            oldValue = employeActuel.divisionId?._id || '';
            newValue = payload.divisionId;
          } else if (field === 'dateNaissance' || field === 'dateRecrutement') {
            oldValue = oldValue ? new Date(oldValue).toISOString() : '';
            newValue = newValue ? newValue.toISOString() : '';
          }
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
      fermerModal();
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
      if (!employe) {
        setErreur('Employé non trouvé pour la suppression.');
        setAfficherCarteSuppression(false);
        return;
      }
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
      setIdSuppression(null);
    } catch (err) {
      setErreur('Échec de la suppression de l\'employé : ' + (err.response?.data?.message || err.message));
      setAfficherCarteSuppression(false);
    }
  };

  const annulerSuppression = () => {
    setAfficherCarteSuppression(false);
    setIdSuppression(null);
  };

  const exporterVersExcelTous = async () => {
    try {
      const token = localStorage.getItem('token');
      const reponse = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tousEmployes = reponse.data;
      if (!tousEmployes || tousEmployes.length === 0) {
        setErreur('Aucun employé à exporter.');
        return;
      }
      const ws = XLSX.utils.json_to_sheet(
        tousEmployes.map((emp) => ({
          'Nom Complet': emp.nomComplet || '',
          CIN: emp.cin || '',
          PPR: emp.ppr || '',
          'Date de Naissance': formatDateSafely(emp.dateNaissance),
          Genre: emp.sexe || '',
          Grade: emp.grade || '',
          'Date de Recrutement': formatDateSafely(emp.dateRecrutement),
          'Ancienneté (ans)': calculateAnciennete(emp.dateRecrutement),
          Diplôme: emp.diplome || '',
          Affectation: emp.affectation || '',
          'Situation Familiale': emp.situationFamiliale || '',
          Division: emp.divisionId?.name || '',
          Mission: emp.missionPoste || '',
          'Formation Initiale': emp.formationInitiale || '',
          'Activité Principale': emp.activitePrincipale || '',
          Adresse: emp.adresse || '',
          Email: emp.email || '',
          'Numéro de Téléphone': emp.numeroTelephone || '',
          'Expérience Externe': emp.experienceExterne || '',
          'Expérience Interne': emp.experienceInterne || '',
          'Informations Supplémentaires': emp.informationsSupplementaires?.join(', ') || '',
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Employés');
      XLSX.writeFile(wb, 'tous_employes.xlsx');
      setShowExportCard(false);
    } catch (err) {
      setErreur('Échec de l\'exportation : ' + (err.response?.data?.message || err.message));
    }
  };

  const exporterVersExcelFiltres = () => {
    if (!employesFiltres || employesFiltres.length === 0) {
      setErreur('Aucun employé filtré à exporter.');
      return;
    }
    try {
      const ws = XLSX.utils.json_to_sheet(
        employesFiltres.map((emp) => ({
          'Nom Complet': emp.nomComplet || '',
          CIN: emp.cin || '',
          PPR: emp.ppr || '',
          'Date de Naissance': formatDateSafely(emp.dateNaissance),
          Genre: emp.sexe || '',
          Grade: emp.grade || '',
          'Date de Recrutement': formatDateSafely(emp.dateRecrutement),
          'Ancienneté (ans)': calculateAnciennete(emp.dateRecrutement),
          Diplôme: emp.diplome || '',
          Affectation: emp.affectation || '',
          'Situation Familiale': emp.situationFamiliale || '',
          Division: emp.divisionId?.name || '',
          Mission: emp.missionPoste || '',
          'Formation Initiale': emp.formationInitiale || '',
          'Activité Principale': emp.activitePrincipale || '',
          Adresse: emp.adresse || '',
          Email: emp.email || '',
          'Numéro de Téléphone': emp.numeroTelephone || '',
          'Expérience Externe': emp.experienceExterne || '',
          'Expérience Interne': emp.experienceInterne || '',
          'Informations Supplémentaires': emp.informationsSupplementaires?.join(', ') || '',
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Employés Filtrés');
      XLSX.writeFile(wb, 'employes_filtres.xlsx');
      setShowExportCard(false);
    } catch (err) {
      setErreur('Échec de l\'exportation : ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setTimeout(() => {
      setBanners((prev) => prev.slice(1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [banners]);

  const employesFiltres = useMemo(() => {
    return employes.filter((emp) => {
      const divisionName = emp.divisionId?.name || '';
      return (
        (emp.nomComplet || '').toLowerCase().includes(filtres.nomComplet.toLowerCase()) &&
        (emp.ppr || '').toLowerCase().includes(filtres.ppr.toLowerCase()) &&
        (emp.affectation || '').toLowerCase().includes(filtres.affectation.toLowerCase()) &&
        (filtres.divisionId ? divisionName.toLowerCase() === filtres.divisionId : true)
      );
    });
  }, [employes, filtres]);

  const employesTries = useMemo(() => {
    return [...employesFiltres].sort((a, b) =>
      triAscendant ? a.nomComplet.localeCompare(b.nomComplet) : b.nomComplet.localeCompare(a.nomComplet)
    );
  }, [employesFiltres, triAscendant]);

  const indexDernierEmploye = pageActuelle * employesParPage;
  const indexPremierEmploye = indexDernierEmploye - employesParPage;
  const employesActuels = employesTries.slice(indexPremierEmploye, indexDernierEmploye);
  const totalPages = Math.ceil(employesTries.length / employesParPage);

  const paginer = (pageNumber) => setPageActuelle(pageNumber);
  const basculerTri = (asc) => setTriAscendant(asc);

  const nomEmployeASupprimer = employes.find((emp) => emp._id === idSuppression)?.nomComplet || 'Inconnu';

  const appContainerStyle = {
    backgroundColor: theme === 'dark' ? '#14131f' : '#ffffff',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    padding: '1.5rem',
    minHeight: '100vh',
    position: 'relative',
  };

  const cardCustomStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#3a3a4a' : '#dee2e6'}`,
    borderRadius: '10px',
    padding: '1rem',
    width: '100%',
  };

  const modalContentStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#3a3a4a' : '#dee2e6'}`,
    borderRadius: '10px',
    padding: '1rem',
    width: '100%',
  };

  const modalHeaderStyle = {
    backgroundColor: theme === 'dark' ? '#3a3a4a' : '#f8f9fa',
    borderColor: theme === 'dark' ? '#4a4a5a' : '#dee2e6',
  };

  const modalBodyStyle = {
    maxHeight: '60vh',
    overflowY: 'auto',
    padding: '1rem',
  };

  const tableContainerStyle = {
    overflowX: 'auto',
    maxHeight: '70vh',
    overflowY: 'auto',
    marginBottom: '2rem',
    width: tableContainerWidth - 48, // Subtract padding (24px on each side from parent)
  };

  const tableCustomStyle = {
    backgroundColor: theme === 'dark' ? '#242434' : '#f8f9fa',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    tableLayout: 'fixed',
    width: '100%',
    borderCollapse: 'collapse',
  };

  const tableHeadStyle = {
    backgroundColor: theme === 'dark' ? '#4a4a5a' : '#f8f9fa',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  };

  const tableRowStyle = (rowId) => ({
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderBottom: `1px solid ${theme === 'dark' ? '#3a3a4a' : '#dee2e6'}`,
    ...(hoveredTableRow === rowId && {
      backgroundColor: theme === 'dark' ? 'rgba(52, 73, 94, 0.8)' : 'rgba(52, 73, 94, 0.2)',
    }),
  });

  const tableCellStyle = {
    padding: '0.8rem 1rem',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    fontSize: '1rem',
    border: 'none',
    whiteSpace: 'nowrap',
  };

  const tableColumnStyles = {
    nomComplet: { width: '10%', minWidth: '60px' }, // Further reduced to prevent overlap
    cin: { width: '6%', minWidth: '35px' },
    ppr: { width: '6%', minWidth: '35px' },
    dateNaissance: { width: '10%', minWidth: '80px' },
    sexe: { width: '6%', minWidth: '30px' },
    grade: { width: '8%', minWidth: '40px' },
    dateRecrutement: { width: '10%', minWidth: '100px' },
    anciennete: { width: '8%', minWidth: '60px' },
    diplome: { width: '10%', minWidth: '120px' },
    affectation: { width: '10%', minWidth: '100px' },
    situationFamiliale: { width: '10%', minWidth: '80px' },
    actions: { width: '10%', minWidth: '70px' },
  };

  const btnStyle = (buttonId, type) => {
    const baseStyle = {
      color: theme === 'dark' ? '#e0e0e0' : '#212529',
      borderColor: theme === 'dark' ? '#4a4a5a' : '#ced4da',
      backgroundColor: 'transparent',
      padding: '0.3rem 0.6rem',
      borderRadius: '4px',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    };

    if (type === 'add') {
      baseStyle.backgroundColor = theme === 'dark' ? 'transparent' : '#28a745';
      baseStyle.color = theme === 'dark' ? '#28a745' : '#ffffff';
      baseStyle.borderColor = theme === 'dark' ? '#28a745' : '#28a745';
      if (hoveredButton === buttonId) {
        baseStyle.backgroundColor = theme === 'dark' ? '#28a745' : '#218838';
        baseStyle.color = '#ffffff';
      }
    } else if (type === 'exporter') {
      baseStyle.backgroundColor = theme === 'dark' ? 'transparent' : '#007bff';
      baseStyle.color = theme === 'dark' ? '#007bff' : '#ffffff';
      baseStyle.borderColor = theme === 'dark' ? '#007bff' : '#007bff';
      if (hoveredButton === buttonId) {
        baseStyle.backgroundColor = theme === 'dark' ? '#007bff' : '#0069d9';
        baseStyle.color = '#ffffff';
      }
    } else {
      if (hoveredButton === buttonId) {
        baseStyle.backgroundColor = theme === 'dark' ? '#3a3a4a' : '#e9ecef';
      }
    }

    return baseStyle;
  };

  const btnOutlineSecondaryStyle = (buttonId) => ({
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    borderColor: theme === 'dark' ? '#4a4a5a' : '#ced4da',
    backgroundColor: 'transparent',
    padding: '0.3rem 0.6rem',
    ...(hoveredButton === buttonId && {
      backgroundColor: theme === 'dark' ? '#3a3a4a' : '#e9ecef',
    }),
  });

  const textMutedStyle = {
    color: theme === 'dark' ? '#a0a0a0' : '#6c757d',
  };

  const formControlStyle = {
    backgroundColor: theme === 'dark' ? '#3a3a4a' : '#ffffff',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    borderColor: theme === 'dark' ? '#4a4a5a' : '#ced4da',
    padding: '0.3rem 0.5rem',
    fontSize: '0.9rem',
  };

  const dropdownMenuStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    color: theme === 'dark' ? '#ee0e0e0' : '#212529',
    borderColor: theme === 'dark' ? '#4a4a5a' : '#dee2e6',
  };

  const dropdownItemStyle = (itemId) => ({
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    ...(hoveredDropdownItem === itemId && {
      backgroundColor: theme === 'dark' ? '#3a3a4a' : '#f8f9fa',
      color: theme === 'dark' ? '#ffffff' : '#495057',
    }),
  });

  const alertDangerStyle = {
    backgroundColor: theme === 'dark' ? '#7f1d1d' : '#f8d7da',
    color: theme === 'dark' ? '#f9a8a8' : '#721c24',
    borderColor: theme === 'dark' ? '#991b1b' : '#f5c6cb',
  };

  const backdropCustomStyle = {
    backgroundColor: theme === 'dark' ? 'rgba(20, 19, 31, 0.8)' : 'rgba(0, 0, 0, 0.5)',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 998,
  };

  const deleteCardStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    border: `1px solid ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'}`,
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const btnOutlineLightStyle = {
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    borderColor: theme === 'dark' ? '#4a4a5a' : '#ced4da',
    padding: '0.3rem 0.6rem',
    ...(hoveredCancelButton && {
      backgroundColor: theme === 'dark' ? '#3a3a4a' : '#e9ecef',
    }),
  };

  const formGroupCompactStyle = {
    marginBottom: '0.5rem',
  };

  const formLabelCompactStyle = {
    marginBottom: '0.2rem',
    fontSize: '0.9rem',
  };

  const formControlCompactStyle = {
    padding: '0.3rem 0.5rem',
    height: '1.8rem',
    fontSize: '0.9rem',
  };

  const bannerStyle = {
    position: 'fixed',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '400px',
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '10px 15px',
    zIndex: 1003,
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    textAlign: 'center',
    animation: 'fadeInOut 5s ease-in-out forwards',
  };

  const exportCardStyle = {
    position: 'absolute',
    top: '40px',
    right: '110px',
    width: '250px',
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '0.5rem',
    zIndex: 1002,
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
  };

  const paginationBtnStyle = (buttonId, disabled) => ({
    backgroundColor: 'transparent',
    borderColor: theme === 'dark' ? '#4a4a5a' : '#ced4da',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    opacity: disabled ? 0.65 : 1,
    ...(hoveredPaginationButton === buttonId && !disabled && {
      backgroundColor: theme === 'dark' ? '#3a3a4a' : '#e9ecef',
    }),
  });

  return (
    <div style={appContainerStyle}>
      <div style={cardCustomStyle}>
        {erreur && <Alert variant="danger" style={{ ...alertDangerStyle, marginBottom: '1rem' }}>{erreur}</Alert>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: 0 }}>Gestion des Employés</h3>
          <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
            <Button
              onClick={() => setShowExportCard(!showExportCard)}
              onMouseEnter={() => setHoveredButton('exporter')}
              onMouseLeave={() => setHoveredButton(null)}
              style={btnStyle('exporter', 'exporter')}
            >
              <BsDownload style={{ marginRight: '0.5rem' }} /> Exporter
            </Button>
            {showExportCard && (
              <div style={exportCardStyle}>
                <Button
                  variant="outline-secondary"
                  onClick={exporterVersExcelTous}
                  onMouseEnter={() => setHoveredButton('export-all')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={{ ...btnStyle('export-all'), width: '100%', marginBottom: '0.5rem', fontSize: '0.9rem' }}
                >
                  Télécharger liste pour tous les employés
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={exporterVersExcelFiltres}
                  onMouseEnter={() => setHoveredButton('export-filtered')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={{ ...btnStyle('export-filtered'), width: '100%', fontSize: '0.9rem' }}
                >
                  Télécharger liste pour les employés filtrés
                </Button>
              </div>
            )}
            <Button
              onClick={() => ouvrirModal()}
              onMouseEnter={() => setHoveredButton('add')}
              onMouseLeave={() => setHoveredButton(null)}
              style={btnStyle('add', 'add')}
            >
              <BsPlus size={16} style={{ marginRight: '0.5rem' }} /> Ajouter
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
          <Form.Control
            type="text"
            name="nomComplet"
            placeholder="Rechercher par nom..."
            value={filtres.nomComplet}
            onChange={gererChangementFiltre}
            style={{ ...formControlStyle, flexGrow: '1', minWidth: '150px' }}
          />
          <ButtonGroup>
            <Button
              variant={triAscendant ? 'outline-primary' : 'outline-secondary'}
              onClick={() => basculerTri(true)}
              onMouseEnter={() => setHoveredButton('sortAsc')}
              onMouseLeave={() => setHoveredButton(null)}
              style={btnOutlineSecondaryStyle('sortAsc')}
            >
              <BsSortAlphaDown />
            </Button>
            <Button
              variant={!triAscendant ? 'outline-primary' : 'outline-secondary'}
              onClick={() => basculerTri(false)}
              onMouseEnter={() => setHoveredButton('sortDesc')}
              onMouseLeave={() => setHoveredButton(null)}
              style={btnOutlineSecondaryStyle('sortDesc')}
            >
              <BsSortAlphaUp />
            </Button>
          </ButtonGroup>
          <Dropdown>
            <Dropdown.Toggle
              variant="outline-secondary"
              onMouseEnter={() => setHoveredButton('dropdown')}
              onMouseLeave={() => setHoveredButton(null)}
              style={btnOutlineSecondaryStyle('dropdown')}
            >
              <BsFilter style={{ marginRight: '0.5rem' }} /> Divisions
            </Dropdown.Toggle>
            <Dropdown.Menu style={dropdownMenuStyle}>
              {divisions.map((division) => (
                <Dropdown.Item
                  key={division._id}
                  active={filtres.divisionId === division.name.toLowerCase()}
                  onClick={() => setFiltres({ ...filtres, divisionId: division.name.toLowerCase() })}
                  onMouseEnter={() => setHoveredDropdownItem(division._id)}
                  onMouseLeave={() => setHoveredDropdownItem(null)}
                  style={dropdownItemStyle(division._id)}
                >
                  {division.name}
                </Dropdown.Item>
              ))}
              <Dropdown.Item
                onClick={() => setFiltres({ ...filtres, divisionId: '' })}
                onMouseEnter={() => setHoveredDropdownItem('clear')}
                onMouseLeave={() => setHoveredDropdownItem(null)}
                style={dropdownItemStyle('clear')}
              >
                Effacer les filtres
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {filtres.divisionId && (
          <div style={{ marginBottom: '1rem' }}>
            <small style={textMutedStyle}>
              Filtre actif: {divisions.find((d) => d.name.toLowerCase() === filtres.divisionId)?.name || 'Inconnu'}
              <Button
                variant="link"
                size="sm"
                onClick={() => setFiltres({ ...filtres, divisionId: '' })}
                style={{ ...btnLinkStyle, padding: '0', marginLeft: '0.5rem' }}
              >
                Effacer
              </Button>
            </small>
          </div>
        )}

        <div style={tableContainerStyle}>
          <Table style={tableCustomStyle}>
            <thead style={tableHeadStyle}>
              <tr>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.nomComplet, textAlign: 'left' }}>Nom Complet</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.cin, textAlign: 'left' }}>CIN</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.ppr, textAlign: 'left' }}>PPR</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.dateNaissance, textAlign: 'left' }}>Date de Naissance</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.sexe, textAlign: 'left' }}>Genre</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.grade, textAlign: 'left' }}>Grade</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.dateRecrutement, textAlign: 'left' }}>Date de Recrutement</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.anciennete, textAlign: 'left' }}>Ancienneté (ans)</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.diplome, textAlign: 'left' }}>Diplôme</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.affectation, textAlign: 'left' }}>Affectation</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.situationFamiliale, textAlign: 'left' }}>Situation Familiale</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.actions, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employesActuels.length > 0 ? (
                employesActuels.map((employe) => (
                  <tr
                    key={employe._id}
                    onClick={() => navigateToDetails(employe._id)}
                    onMouseEnter={() => setHoveredTableRow(employe._id)}
                    onMouseLeave={() => setHoveredTableRow(null)}
                    style={tableRowStyle(employe._id)}
                  >
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.nomComplet }}>{employe.nomComplet || ''}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.cin }}>{employe.cin || ''}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.ppr }}>{employe.ppr || ''}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.dateNaissance }}>{formatDateSafely(employe.dateNaissance)}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.sexe }}>{employe.sexe || ''}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.grade }}>{employe.grade || ''}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.dateRecrutement }}>{formatDateSafely(employe.dateRecrutement)}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.anciennete }}>{`${calculateAnciennete(employe.dateRecrutement)} ans` || 'N/A'}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.diplome }}>{employe.diplome || ''}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.affectation }}>{employe.affectation || ''}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.situationFamiliale }}>{employe.situationFamiliale || ''}</td>
                    <td style={{ ...tableCellStyle, ...tableColumnStyles.actions, textAlign: 'center' }}>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); gererAfficherDetails(employe); }}
                        style={{ padding: '0.2rem 0.4rem', marginRight: '0.2rem' }}
                        title="Voir Détails"
                      >
                        <BsEye />
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); ouvrirModal(employe); }}
                        style={{ padding: '0.2rem 0.4rem', marginRight: '0.2rem' }}
                        title="Modifier"
                      >
                        <BsPencil />
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={(e) => gererSuppression(e, employe._id)}
                        style={{ padding: '0.2rem 0.4rem' }}
                        title="Supprimer"
                      >
                        <BsTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" style={{ ...tableCellStyle, textAlign: 'center', padding: '1rem', color: theme === 'dark' ? '#a0a0a0' : '#6c757d' }}>
                    Aucun employé trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <Button
            variant="outline-secondary"
            onClick={() => paginer(pageActuelle - 1)}
            disabled={pageActuelle === 1}
            onMouseEnter={() => setHoveredPaginationButton('prev')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            style={{ ...paginationBtnStyle('prev', pageActuelle === 1), marginRight: '0.5rem' }}
          >
            Précédent
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant="outline-secondary"
              onClick={() => paginer(i + 1)}
              onMouseEnter={() => setHoveredPaginationButton(i + 1)}
              onMouseLeave={() => setHoveredPaginationButton(null)}
              style={{
                ...paginationBtnStyle(i + 1, false),
                marginRight: '0.5rem',
                fontWeight: pageActuelle === i + 1 ? 'bold' : 'normal',
              }}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline-secondary"
            onClick={() => paginer(pageActuelle + 1)}
            disabled={pageActuelle === totalPages}
            onMouseEnter={() => setHoveredPaginationButton('next')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            style={paginationBtnStyle('next', pageActuelle === totalPages)}
          >
            Suivant
          </Button>
        </div>

        {banners.map((banner) => (
          <div key={banner.id} style={bannerStyle}>
            {banner.message}
          </div>
        ))}

        <Modal show={afficherModal} onHide={fermerModal} centered>
          <div style={modalContentStyle}>
            <Modal.Header closeButton style={modalHeaderStyle}>
              <Modal.Title>{employeActuel ? 'Modifier Employé' : 'Ajouter Employé'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={modalBodyStyle}>
              <Form onSubmit={gererSoumission} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                {[
                  { label: 'Nom Complet', name: 'nomComplet', type: 'text', required: true },
                  { label: 'Date de Naissance', name: 'dateNaissance', type: 'date' },
                  { label: 'Genre', name: 'sexe', type: 'select', options: ['', 'Homme', 'Femme'], required: true },
                  { label: 'Grade', name: 'grade', type: 'text' },
                  { label: 'Date de Recrutement', name: 'dateRecrutement', type: 'date', required: true },
                  { label: 'Diplôme', name: 'diplome', type: 'text' },
                  { label: 'Affectation', name: 'affectation', type: 'text' },
                  { label: 'Situation Familiale', name: 'situationFamiliale', type: 'select', options: ['', 'Célibataire', 'Marié', 'Divorcé'] },
                  { label: 'Mission', name: 'missionPoste', type: 'text' },
                  { label: 'Division', name: 'divisionId', type: 'select', options: [''].concat(divisions.map(d => d._id)), labels: [''].concat(divisions.map(d => d.name)), required: true },
                  { label: 'Formation Initiale', name: 'formationInitiale', type: 'text' },
                  { label: 'Activité Principale', name: 'activitePrincipale', type: 'text' },
                  { label: 'CIN', name: 'cin', type: 'text' },
                  { label: 'PPR', name: 'ppr', type: 'text' },
                  { label: 'Adresse', name: 'adresse', type: 'text' },
                  { label: 'Email', name: 'email', type: 'email', required: true },
                  { label: 'Numéro de Téléphone', name: 'numeroTelephone', type: 'text' },
                  { label: 'Expérience Externe', name: 'experienceExterne', type: 'text' },
                  { label: 'Expérience Interne', name: 'experienceInterne', type: 'text' },
                  { label: 'Informations Supplémentaires', name: 'informationsSupplementaires', type: 'text', placeholder: 'Séparez par des virgules' },
                  { label: 'Image', name: 'image', type: 'file', accept: 'image/jpeg' },
                  { label: 'Ancienneté (ans)', name: 'anciennete', type: 'text', readOnly: true },
                ].map((field, idx) => (
                  <Form.Group key={idx} style={{ ...formGroupCompactStyle, flex: '1 1 48%', minWidth: '200px' }}>
                    <Form.Label style={formLabelCompactStyle}>{field.label}</Form.Label>
                    {field.type === 'select' ? (
                      <Form.Select
                        name={field.name}
                        value={donneesFormulaire[field.name]}
                        onChange={gererChangementInput}
                        required={field.required}
                        style={{ ...formControlStyle, ...formControlCompactStyle, borderRadius: '0.3rem' }}
                      >
                        {field.options.map((option, i) => (
                          <option key={i} value={option}>
                            {field.labels ? field.labels[i] : option || `Sélectionner ${field.label}`}
                          </option>
                        ))}
                      </Form.Select>
                    ) : field.type === 'file' ? (
                      <>
                        <Form.Control
                          type="file"
                          accept={field.accept}
                          onChange={handleImageChange}
                          style={{ ...formControlStyle, ...formControlCompactStyle, borderRadius: '0.3rem' }}
                        />
                        {imagePreview && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100px' }} />
                          </div>
                        )}
                      </>
                    ) : (
                      <Form.Control
                        type={field.type}
                        name={field.name}
                        value={donneesFormulaire[field.name]}
                        onChange={gererChangementInput}
                        required={field.required}
                        readOnly={field.readOnly}
                        placeholder={field.placeholder}
                        style={{ ...formControlStyle, ...formControlCompactStyle, borderRadius: '0.3rem' }}
                      />
                    )}
                  </Form.Group>
                ))}
                <Button
                  variant="outline-secondary"
                  type="submit"
                  onMouseEnter={() => setHoveredButton('submit')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={{ ...btnStyle('submit'), marginTop: '1rem', width: '100%', borderRadius: '0.3rem' }}
                >
                  Enregistrer
                </Button>
              </Form>
            </Modal.Body>
          </div>
        </Modal>

        <Modal show={afficherModalDetails} onHide={() => setAfficherModalDetails(false)} centered>
          <div style={modalContentStyle}>
            <Modal.Header closeButton style={modalHeaderStyle}>
              <Modal.Title>Détails de l'Employé</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ ...modalBodyStyle, paddingTop: '1rem' }}>
              {employeActuel && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {[
                    { label: 'Nom Complet', value: employeActuel.nomComplet },
                    { label: 'Date de Naissance', value: formatDateSafely(employeActuel.dateNaissance) },
                    { label: 'Genre', value: employeActuel.sexe },
                    { label: 'Grade', value: employeActuel.grade },
                    { label: 'Date de Recrutement', value: formatDateSafely(employeActuel.dateRecrutement) },
                    { label: 'Diplôme', value: employeActuel.diplome },
                    { label: 'Affectation', value: employeActuel.affectation },
                    { label: 'Situation Familiale', value: employeActuel.situationFamiliale },
                    { label: 'Mission', value: employeActuel.missionPoste },
                    { label: 'Division', value: employeActuel.divisionId?.name || 'Inconnue' },
                    { label: 'Formation Initiale', value: employeActuel.formationInitiale },
                    { label: 'Activité Principale', value: employeActuel.activitePrincipale },
                    { label: 'CIN', value: employeActuel.cin },
                    { label: 'PPR', value: employeActuel.ppr },
                    { label: 'Adresse', value: employeActuel.adresse },
                    { label: 'Email', value: employeActuel.email },
                    { label: 'Numéro de Téléphone', value: employeActuel.numeroTelephone },
                    { label: 'Expérience Externe', value: employeActuel.experienceExterne },
                    { label: 'Expérience Interne', value: employeActuel.experienceInterne },
                    { label: 'Informations Supplémentaires', value: employeActuel.informationsSupplementaires?.join(', ') || '' },
                    { label: 'Ancienneté (ans)', value: calculateAnciennete(employeActuel.dateRecrutement) },
                  ].map((field, idx) => (
                    <div key={idx} style={{ flex: '1 1 48%', minWidth: '200px', marginBottom: '0.5rem' }}>
                      <strong>{field.label} :</strong> {field.value || ''}
                    </div>
                  ))}
                </div>
              )}
            </Modal.Body>
          </div>
        </Modal>

        {afficherCarteSuppression && (
          <div style={{ ...backdropCustomStyle, zIndex: 1050 }}>
            <Card style={{ ...deleteCardStyle, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20rem' }}>
              <Card.Body>
                <Card.Title>Confirmer la Suppression</Card.Title>
                <Card.Text>Êtes-vous sûr de vouloir supprimer l'employé <strong>{nomEmployeASupprimer}</strong> ?</Card.Text>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                  <Button
                    variant="outline-secondary"
                    onClick={confirmerSuppression}
                    onMouseEnter={() => setHoveredDeleteButton(true)}
                    onMouseLeave={() => setHoveredDeleteButton(false)}
                    style={{ ...btnOutlineLightStyle, width: '80px' }}
                  >
                    Oui
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={annulerSuppression}
                    onMouseEnter={() => setHoveredCancelButton(true)}
                    onMouseLeave={() => setHoveredCancelButton(false)}
                    style={{ ...btnOutlineLightStyle, width: '80px' }}
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
  );
};

export default PageEmployes;