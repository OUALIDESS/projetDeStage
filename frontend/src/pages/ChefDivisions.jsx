import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Card, Table } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { BsPeople } from 'react-icons/bs';
import * as XLSX from 'xlsx';

const ChefDivisions = ({ theme = 'light' }) => {
  const [divisions, setDivisions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [formData, setFormData] = useState({ managerId: '', employeeIds: [], managerLabel: '', employeeLabels: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [hoveredPaginationButton, setHoveredPaginationButton] = useState(null); // For hover effects

  // Fetch all divisions on component mount
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Aucun jeton disponible');
        const res = await axios.get('http://localhost:5000/api/divisions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDivisions(res.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des divisions:', err.response?.data || err.message);
        setError('Échec de la récupération des divisions: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchDivisions();
  }, []);

  // Open modal and set initial form data for the selected division
  const handleOpenModal = (division) => {
    setSelectedDivision(division);
    const managerLabel = division.managerId ? `${division.managerId.nomComplet} (${division.managerId.grade || 'N/A'})` : '';
    const employeeLabels = division.employeeIds.map((emp) => ({
      value: emp._id,
      label: `${emp.nomComplet} (${emp.grade || 'N/A'})`,
    }));
    setFormData({
      managerId: division.managerId?._id || '',
      employeeIds: division.employeeIds.map((emp) => emp._id) || [],
      managerLabel,
      employeeLabels,
    });
    setShowModal(true);
    setError(null);
  };

  // Load manager options
  const loadManagerOptions = async (inputValue) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Aucun jeton disponible');
      const params = new URLSearchParams();
      params.append('query', inputValue || '');
      if (formData.managerId) params.append('excludeId', formData.managerId);
      const res = await axios.get(`http://localhost:5000/api/employees/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data
        .filter((emp) => emp._id !== formData.managerId)
        .map((emp) => ({
          value: emp._id,
          label: `${emp.nomComplet} (${emp.grade || 'N/A'})`,
        }));
    } catch (err) {
      console.error('Erreur lors du chargement des managers:', err.response?.data || err.message);
      setError('Échec du chargement des managers: ' + (err.response?.data?.message || err.message));
      return [];
    }
  };

  // Load employee options
  const loadEmployeeOptions = async (inputValue) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Aucun jeton disponible');
      const params = new URLSearchParams();
      params.append('query', inputValue || '');
      if (formData.managerId) params.append('excludeId', formData.managerId);
      const res = await axios.get(`http://localhost:5000/api/employees/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data
        .filter((emp) => emp._id !== formData.managerId)
        .map((emp) => ({
          value: emp._id,
          label: `${emp.nomComplet} (${emp.grade || 'N/A'})`,
        }));
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err.response?.data || err.message);
      setError('Échec du chargement des employés: ' + (err.response?.data?.message || err.message));
      return [];
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Aucun jeton disponible');
      const res = await axios.put(
        `http://localhost:5000/api/divisions/${selectedDivision._id}`,
        {
          managerId: formData.managerId || null,
          employeeIds: formData.employeeIds || [],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            allowSeededUpdate: 'true',
          },
        }
      );
      setDivisions((prev) =>
        prev.map((div) => (div._id === selectedDivision._id ? { ...div, ...res.data } : div))
      );
      setShowModal(false);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la division:', err.response?.data || err.message);
      setError('Échec de la mise à jour de la division: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle manager selection
  const handleManagerChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      managerId: selectedOption ? selectedOption.value : '',
      managerLabel: selectedOption ? selectedOption.label : '',
    }));
  };

  // Handle employee selection
  const handleEmployeeChange = (selectedOptions) => {
    const newEmployeeLabels = selectedOptions ? selectedOptions.map((option) => ({
      value: option.value,
      label: option.label,
    })) : [];
    setFormData((prev) => ({
      ...prev,
      employeeIds: selectedOptions ? selectedOptions.map((option) => option.value) : [],
      employeeLabels: newEmployeeLabels,
    }));
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = divisions.map((division) => ({
      Division: division.name,
      Manager: division.managerId ? division.managerId.nomComplet : 'Aucun',
      Employés: division.employeeIds.length > 0 ? division.employeeIds.map((emp) => emp.nomComplet).join(', ') : 'Aucun',
      'Date de Génération': new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Divisions');
    XLSX.writeFile(workbook, 'divisions_report.xlsx');
  };

  // Pagination logic
  const totalPages = Math.ceil(divisions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDivisions = divisions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--border-color)',
      color: 'var(--text-color)',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'var(--primary-color)',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--card-bg)',
      color: 'var(--text-color)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--primary-color)' : state.isFocused ? 'var(--secondary-bg)' : 'var(--card-bg)',
      color: 'var(--text-color)',
      '&:hover': {
        backgroundColor: 'var(--secondary-bg)',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--text-color)',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'var(--secondary-bg)',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'var(--text-color)',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'var(--text-color)',
      '&:hover': {
        backgroundColor: 'var(--danger-color)',
        color: 'white',
      },
    }),
  };

  const cardCustomStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#3a3a4a' : '#dee2e6'}`,
    borderRadius: '10px',
    padding: '1rem',
    width: '100%',
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

  const tableCellStyle = {
    padding: '0.8rem 1rem',
    color: theme === 'dark' ? '#e0e0e0' : '#212529',
    fontSize: '1rem',
    border: 'none',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  };

  const tableColumnStyles = {
    division: { width: '20%', minWidth: '100px' },
    manager: { width: '25%', minWidth: '120px' },
    employees: { width: '35%', minWidth: '150px' },
    actions: { width: '20%', minWidth: '100px' },
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
    <div style={{ backgroundColor: theme === 'dark' ? '#14131f' : '#ffffff', color: theme === 'dark' ? '#e0e0e0' : '#212529', padding: '1.5rem', minHeight: '100vh' }}>
      <div style={cardCustomStyle}>
        <h3 style={{ marginBottom: '1rem' }}>Chef Divisions</h3>
        {loading && <div style={{ color: theme === 'dark' ? '#a0a0a0' : '#6c757d' }}>Chargement...</div>}
        {error && <div style={{ color: theme === 'dark' ? '#f9a8a8' : '#721c24', marginBottom: '1rem' }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div></div>
          <Button variant="primary" onClick={handleExportExcel} style={{ color: theme === 'dark' ? '#e0e0e0' : '#ffffff', backgroundColor: theme === 'dark' ? 'transparent' : '#007bff', borderColor: theme === 'dark' ? '#007bff' : '#007bff' }}>
            Exporter en Excel
          </Button>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '70vh', overflowY: 'auto', marginBottom: '2rem' }}>
          <Table style={tableCustomStyle}>
            <thead style={tableHeadStyle}>
              <tr>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.division, textAlign: 'left' }}>Division</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.manager, textAlign: 'left' }}>Manager</th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.employees, textAlign: 'left' }}>
                  <BsPeople size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Employés
                </th>
                <th style={{ ...tableCellStyle, ...tableColumnStyles.actions, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDivisions.map((division) => (
                <tr key={division._id} style={{ backgroundColor: 'transparent', borderBottom: `1px solid ${theme === 'dark' ? '#3a3a4a' : '#dee2e6'}` }}>
                  <td style={{ ...tableCellStyle, ...tableColumnStyles.division }}>{division.name}</td>
                  <td style={{ ...tableCellStyle, ...tableColumnStyles.manager }}>{division.managerId ? division.managerId.nomComplet : 'Aucun'}</td>
                  <td style={{ ...tableCellStyle, ...tableColumnStyles.employees }}>
                    {division.employeeIds.length > 0
                      ? division.employeeIds.map((emp) => emp.nomComplet).join(', ')
                      : 'Aucun'}
                  </td>
                  <td style={{ ...tableCellStyle, ...tableColumnStyles.actions, textAlign: 'center' }}>
                    <Button variant="outline-secondary" onClick={() => handleOpenModal(division)} style={{ padding: '0.3rem 0.6rem', color: theme === 'dark' ? '#e0e0e0' : '#212529', borderColor: theme === 'dark' ? '#4a4a5a' : '#ced4da' }}>
                      Modifier
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <Button
            variant="outline-secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            onMouseEnter={() => setHoveredPaginationButton('prev')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            style={{ ...paginationBtnStyle('prev', currentPage === 1), marginRight: '0.5rem' }}
          >
            Précédent
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant="outline-secondary"
              onClick={() => handlePageChange(i + 1)}
              onMouseEnter={() => setHoveredPaginationButton(i + 1)}
              onMouseLeave={() => setHoveredPaginationButton(null)}
              style={{
                ...paginationBtnStyle(i + 1, false),
                marginRight: '0.5rem',
                fontWeight: currentPage === i + 1 ? 'bold' : 'normal',
              }}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline-secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            onMouseEnter={() => setHoveredPaginationButton('next')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            style={paginationBtnStyle('next', currentPage === totalPages)}
          >
            Suivant
          </Button>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: theme === 'dark' ? '#3a3a4a' : '#f8f9fa', borderColor: theme === 'dark' ? '#4a4a5a' : '#dee2e6' }}>
          <Modal.Title>Modifier Manager et Équipe pour {selectedDivision?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff', color: theme === 'dark' ? '#e0e0e0' : '#212529', maxHeight: '60vh', overflowY: 'auto', padding: '1rem' }}>
          {loading && <div>Chargement...</div>}
          {error && <div style={{ color: theme === 'dark' ? '#f9a8a8' : '#721c24' }}>{error}</div>}
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="managerId" style={{ marginBottom: '15px' }}>
              <Form.Label>Manager:</Form.Label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadManagerOptions}
                onChange={handleManagerChange}
                value={formData.managerId ? { value: formData.managerId, label: formData.managerLabel } : null}
                placeholder="Rechercher un manager..."
                styles={customSelectStyles}
                isClearable
              />
            </Form.Group>
            <Form.Group controlId="employeeIds" style={{ marginBottom: '15px' }}>
              <Form.Label>Employés:</Form.Label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadEmployeeOptions}
                onChange={handleEmployeeChange}
                value={formData.employeeLabels}
                placeholder="Rechercher des employés..."
                styles={customSelectStyles}
                isMulti
                isClearable
              />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ marginRight: '10px', color: theme === 'dark' ? '#e0e0e0' : '#ffffff', backgroundColor: theme === 'dark' ? 'transparent' : '#007bff', borderColor: theme === 'dark' ? '#007bff' : '#007bff' }}>
              Enregistrer
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)} style={{ color: theme === 'dark' ? '#e0e0e0' : '#212529', backgroundColor: theme === 'dark' ? 'transparent' : '#6c757d', borderColor: theme === 'dark' ? '#4a4a5a' : '#ced4da' }}>
              Annuler
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ChefDivisions;