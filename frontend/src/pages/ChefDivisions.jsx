import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, Alert, Button, Modal, Form, ListGroup, ButtonGroup, Dropdown, Badge } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsDownload, BsEye, BsPencil, BsTrash, BsSortAlphaDown, BsSortAlphaUp, BsFilter } from 'react-icons/bs';

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
  'Ingenieur': '#ff7f50',
};

const ChefDivisions = ({ theme = 'light' }) => {
  const navigate = useNavigate();
  const [divisions, setDivisions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [formData, setFormData] = useState({ divisionId: '', managerId: '', employeeIds: [] });
  const [selectedManager, setSelectedManager] = useState(null);
  const [searchTerm, setSearchTerm] = useState({ managerName: '', grade: '' });
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [divisionsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to access this page');
          navigate('/login');
          return;
        }

        const [divisionRes, employeeRes, gradeRes] = await Promise.all([
          axios.get('http://localhost:5000/api/divisions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/divisions/employees', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => {
            console.error('Employees API Error:', err.response?.data || err.message);
            throw new Error('Failed to load employees: ' + (err.response?.data?.message || 'Endpoint not found (404)'));
          }),
          axios.get('http://localhost:5000/api/grades', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

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
        setEmployees(employeeRes.data);
        setGrades(gradeRes.data);
      } catch (err) {
        setError(err.message);
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
    setShowDeleteModal(false);
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

  const handleDelete = (e, division) => {
    e.stopPropagation();
    setSelectedDivision(division);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/divisions/${selectedDivision._id}`,
        { managerId: null },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDivisions(
        divisions.map((div) =>
          div._id === selectedDivision._id
            ? {
                ...res.data,
                employeeNames:
                  res.data.employeeIds.map((emp) => emp.nomComplet).join(', ') ||
                  'No Employees',
              }
            : div
        )
      );
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete manager: ' + (err.response?.data?.message || err.message));
      setShowDeleteModal(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/divisions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allDivisions = response.data;
      const ws = XLSX.utils.json_to_sheet(
        allDivisions.map((div) => ({
          'Division': div.name || 'N/A',
          'Manager': div.managerId ? div.managerId.nomComplet : 'No Manager Assigned',
          'Grade': div.managerId ? div.managerId.grade : '-',
          'Mission': div.managerId ? div.managerId.missionPoste : '-',
          'Employees Managed': div.employeeIds
            .filter((emp) => !div.managerId || emp._id.toString() !== div.managerId.toString())
            .map((emp) => emp.nomComplet)
            .join(', ') || 'No Employees',
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Divisions');
      XLSX.writeFile(wb, 'all_divisions.xlsx');
    } catch (err) {
      setError('Failed to export to Excel: ' + (err.response?.data?.message || err.message));
      console.error('Excel export error:', err.response?.data || err);
    }
  };

  const filteredDivisions = divisions.filter((div) =>
    (!div.managerId || (div.managerId.nomComplet || '').toLowerCase().includes(searchTerm.managerName.toLowerCase())) &&
    (!div.managerId || (div.managerId.grade || '').toLowerCase().includes(searchTerm.grade.toLowerCase())) &&
    (selectedGrades.length === 0 || (div.managerId && selectedGrades.includes(div.managerId.grade)))
  );

  const sortedDivisions = [...filteredDivisions].sort((a, b) =>
    sortAsc
      ? (a.managerId?.nomComplet || '').localeCompare(b.managerId?.nomComplet || '')
      : (b.managerId?.nomComplet || '').localeCompare(a.managerId?.nomComplet || '')
  );

  const indexOfLastDivision = currentPage * divisionsPerPage;
  const indexOfFirstDivision = indexOfLastDivision - divisionsPerPage;
  const currentDivisions = sortedDivisions.slice(indexOfFirstDivision, indexOfLastDivision);
  const totalPages = Math.ceil(sortedDivisions.length / divisionsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleSort = (asc) => {
    setSortAsc(asc);
  };

  const handleSearchChange = (e) => {
    setSearchTerm({ ...searchTerm, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const toggleGradeFilter = (grade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade]
    );
    setCurrentPage(1);
  };

  const clearGradeFilters = () => {
    setSelectedGrades([]);
    setSearchTerm({ managerName: '', grade: '' });
    setCurrentPage(1);
  };

  const handleManagerChange = (option) =>
    setFormData({ ...formData, managerId: option ? option.value : '' });

  const handleEmployeeChange = (options) =>
    setFormData({
      ...formData,
      employeeIds: options.map((opt) => opt.value),
    });

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

  const loadManagerOptions = async (inputValue) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const params = new URLSearchParams();
      params.append('query', inputValue || '');
      if (formData.managerId) {
        params.append('excludeId', formData.managerId);
      }
      const res = await axios.get(`http://localhost:5000/api/divisions/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data
        .filter((emp) => emp._id !== formData.managerId)
        .map((emp) => ({
          value: emp._id,
          label: `${emp.nomComplet} (${emp.grade || 'N/A'})`,
        }));
    } catch (err) {
      console.error('Error loading managers:', err.response?.data || err.message);
      setError('Failed to load managers: ' + (err.response?.data?.message || err.message));
      return [];
    }
  };

  const loadEmployeeOptions = async (inputValue) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const divisionId = selectedDivision?._id;
      const params = new URLSearchParams();
      params.append('query', inputValue || '');
      if (formData.managerId) {
        params.append('excludeId', formData.managerId);
      }
      if (divisionId && typeof divisionId === 'string' && divisionId.length === 24) {
        params.append('divisionId', divisionId);
      }
      const res = await axios.get(`http://localhost:5000/api/divisions/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data
        .filter((emp) => emp._id !== formData.managerId)
        .map((emp) => ({
          value: emp._id,
          label: `${emp.nomComplet} (${emp.grade || 'N/A'})`,
        }));
    } catch (err) {
      console.error('Error loading employees:', err.response?.data || err.message);
      setError('Failed to load employees: ' + (err.response?.data?.message || err.message));
      return [];
    }
  };

  const getDivisionEmployees = (divisionId) =>
    employees
      .filter((emp) => emp.divisionId && emp.divisionId.toString() === divisionId.toString())
      .map((emp) => ({
        value: emp._id,
        label: `${emp.nomComplet} (${emp.grade || 'N/A'})`,
      }));

  return (
    <div className="app-container">
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

          .react-select__control {
            background-color: ${theme === 'dark' ? '#3a3a4a' : '#ffffff'} !important;
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'} !important;
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#ced4da'} !important;
          }

          .react-select__single-value, .react-select__multi-value__label {
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'} !important;
          }

          .react-select__menu {
            background-color: ${theme === 'dark' ? '#2a2a3a' : '#ffffff'} !important;
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'} !important;
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'} !important;
          }

          .react-select__option {
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'} !important;
          }

          .react-select__option--is-focused {
            background-color: ${theme === 'dark' ? '#3a3a4a' : '#f8f9fa'} !important;
            color: ${theme === 'dark' ? '#ffffff' : '#495057'} !important;
          }

          .react-select__multi-value {
            background-color: ${theme === 'dark' ? '#4a4a5a' : '#e9ecef'} !important;
          }

          .list-group-item {
            background-color: ${theme === 'dark' ? '#2a2a3a' : '#ffffff'} !important;
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'} !important;
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'} !important;
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
      <div className="card-custom">
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Division Managers</h3>
          <div className="d-flex gap-2">
            <Button variant="exporter" onClick={exportToExcel}>
              <BsDownload className="me-2" /> Export
            </Button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
          <div className="flex-grow-1">
            <Form.Control
              type="text"
              name="managerName"
              placeholder="Search by manager name..."
              value={searchTerm.managerName}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex-grow-1">
            <Form.Control
              type="text"
              name="grade"
              placeholder="Search by grade..."
              value={searchTerm.grade}
              onChange={handleSearchChange}
            />
          </div>
          <ButtonGroup>
            <Button variant={sortAsc ? 'primary' : 'outline-secondary'} onClick={() => toggleSort(true)}>
              <BsSortAlphaDown />
            </Button>
            <Button variant={!sortAsc ? 'primary' : 'outline-secondary'} onClick={() => toggleSort(false)}>
              <BsSortAlphaUp />
            </Button>
          </ButtonGroup>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary">
              <BsFilter className="me-2" /> Manager Grades
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
                Clear Filters
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {selectedGrades.length > 0 && (
          <div className="mb-4">
            <small className="text-muted">
              Active Filters: {selectedGrades.join(', ')}
              <Button
                variant="link"
                size="sm"
                className="text-danger p-0 ms-2"
                onClick={clearGradeFilters}
              >
                Clear
              </Button>
            </small>
          </div>
        )}

        <div className="table-container">
          <Table className="table-custom">
            <thead>
              <tr>
                <th>Division</th>
                <th>Manager</th>
                <th>Grade</th>
                <th>Mission</th>
                <th>Employees Managed</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDivisions.length > 0 ? (
                currentDivisions.map((division) => (
                  <tr
                    key={division._id}
                    onClick={() => handleRowClick(division.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{division.name}</td>
                    <td>{division.managerId ? division.managerId.nomComplet : 'No Manager Assigned'}</td>
                    <td>{division.managerId ? <GradeBadge grade={division.managerId.grade} /> : '-'}</td>
                    <td>{division.managerId ? division.managerId.missionPoste : '-'}</td>
                    <td>{division.employeeNames}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() => handleDetailsModalOpen(division)}
                        >
                          <BsEye />
                        </Button>
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() => handleModifyModalOpen(division)}
                        >
                          <BsPencil />
                        </Button>
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={(e) => handleDelete(e, division)}
                        >
                          <BsTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No divisions found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            variant="pagination-btn"
            className="me-2"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              variant="pagination-btn"
              className="me-2"
              active={currentPage === i + 1}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="pagination-btn"
          >
            Next
          </Button>
        </div>

        {/* Modify Manager Modal */}
        <Modal show={showModifyModal} onHide={handleModalClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Modify Manager and Team</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleFormSubmit}>
              <Form.Group className="mb-3 form-group-compact">
                <Form.Label className="form-label-compact">Division</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedDivision ? selectedDivision.name : ''}
                  disabled
                  className="form-control-compact"
                />
              </Form.Group>
              <Form.Group className="mb-3 form-group-compact">
                <Form.Label className="form-label-compact">New Manager</Form.Label>
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
                  onChange={handleManagerChange}
                  placeholder="Type to search for a new manager..."
                  isClearable
                  minLength={2}
                />
              </Form.Group>
              <Form.Group className="mb-3 form-group-compact">
                <Form.Label className="form-label-compact">New Team Members</Form.Label>
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
                  onChange={handleEmployeeChange}
                  placeholder="Type to search employees for the new team..."
                  minLength={2}
                />
              </Form.Group>
              {selectedDivision && (
                <>
                  <Form.Group className="mb-3 form-group-compact">
                    <Form.Label className="form-label-compact">Available Employees</Form.Label>
                    <ListGroup>
                      {getDivisionEmployees(selectedDivision._id).map((emp) => (
                        <ListGroup.Item key={emp.value}>{emp.label}</ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Form.Group>
                  <Form.Group className="mb-3 form-group-compact">
                    <Form.Label className="form-label-compact">Current Team</Form.Label>
                    <ListGroup>
                      {getDivisionEmployees(selectedDivision._id).map((emp) => (
                        <ListGroup.Item key={emp.value}>{emp.label}</ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Form.Group>
                </>
              )}
              <Button variant="primary" type="submit" className="mt-3 w-100">
                Save New Manager and Team
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* View Details Modal */}
        <Modal show={showDetailsModal} onHide={handleModalClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Manager Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedManager ? (
              <div className="row g-3">
                <div className="col-12 col-md-6"><strong>Full Name:</strong> {selectedManager.nomComplet || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Grade:</strong> {selectedManager.grade || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Mission:</strong> {selectedManager.missionPoste || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Date of Birth:</strong> {selectedManager.dateNaissance || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Gender:</strong> {selectedManager.sexe || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Email:</strong> {selectedManager.email || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Phone Number:</strong> {selectedManager.numeroTelephone || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Hire Date:</strong> {selectedManager.dateRecrutement || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Degree:</strong> {selectedManager.diplome || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Assignment:</strong> {selectedManager.affectation || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Marital Status:</strong> {selectedManager.situationFamiliale || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Initial Training:</strong> {selectedManager.formationInitiale || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Main Activity:</strong> {selectedManager.activitePrincipale || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>CIN:</strong> {selectedManager.cin || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>PPR:</strong> {selectedManager.ppr || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Address:</strong> {selectedManager.adresse || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>External Experience:</strong> {selectedManager.experienceExterne || 'N/A'}</div>
                <div className="col-12 col-md-6"><strong>Internal Experience:</strong> {selectedManager.experienceInterne || 'N/A'}</div>
              </div>
            ) : (
              <p className="text-center text-muted">No details available</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleModalClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title>Confirm Removal</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <div className="fs-5 mb-3">
              Are you sure you want to remove the manager from{' '}
              {selectedDivision?.name}?
            </div>
            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="outline-secondary"
                onClick={() => setShowDeleteModal(false)}
                className="px-4"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                className="px-4"
              >
                Confirm
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default ChefDivisions;