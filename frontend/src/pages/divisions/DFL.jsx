import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Alert, Button, Form, Badge } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsDownload } from 'react-icons/bs';

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

const DFLPage = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState({ name: '', grade: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch divisions
      const divisionResponse = await axios.get('http://localhost:5000/api/divisions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const daec = divisionResponse.data.find((div) => div.name === 'DFL');
      if (!daec) {
        setError('DFL division not found');
        return;
      }

      // Fetch employees
      const employeeResponse = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter employees for DAEC
      const filteredEmployees = employeeResponse.data.filter((emp) => {
        const divisionId = emp.divisionId?._id || emp.divisionId;
        return divisionId === daec._id || divisionId?.toString() === daec._id.toString();
      });
      setEmployees(filteredEmployees);

      if (filteredEmployees.length === 0) {
        setError('No employees found for DFL');
      }
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
      console.error('Fetch error:', err);
    }
  };

  // Search and Filter Logic
  const filteredEmployees = employees.filter((emp) =>
    (emp.nomComplet || '').toLowerCase().includes(searchTerm.name.toLowerCase()) &&
    (emp.grade || '').toLowerCase().includes(searchTerm.grade.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearchChange = (e) => {
    setSearchTerm({ ...searchTerm, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        filteredEmployees.map((emp) => ({
          Name: emp.nomComplet || 'N/A',
          Grade: emp.grade || 'N/A',
          Mission: emp.missionPoste || 'N/A',
          Division: 'DFL',
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DFL Employees');
      XLSX.writeFile(wb, 'dfl_employees.xlsx');
    } catch (err) {
      setError('Failed to export to Excel: ' + err.message);
      console.error('Excel export error:', err);
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
      {grade || 'N/A'}
    </Badge>
  );

  return (
    <div className="min-vh-100 p-4">
      <div className="container-lg">
        <div className="bg-white rounded-3 p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">DAEC Division</h2>
            <Button variant="outline-secondary" onClick={exportToExcel}>
              <BsDownload className="me-2" /> Export
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="d-flex flex-wrap gap-3 mb-3 align-items-center">
            <div className="flex-grow-1">
              <Form.Control
                type="text"
                name="name"
                placeholder="Search by name..."
                value={searchTerm.name}
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
          </div>

          <div className="table-responsive">
            <Table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Mission</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td>{employee.nomComplet || 'N/A'}</td>
                      <td>
                        <GradeBadge grade={employee.grade} />
                      </td>
                      <td>{employee.missionPoste || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-4">
                      No employees available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-center mt-3">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="me-2"
              variant="outline-secondary"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className="me-2"
                variant={currentPage === i + 1 ? 'primary' : 'outline-secondary'}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline-secondary"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DFLPage;