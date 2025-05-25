import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const DAIPage = () => {
  const [employees, setEmployees] = useState([]);
  const [division, setDivision] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      // Fetch divisions
      const divisionResponse = await axios.get('http://localhost:5000/api/divisions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Divisions response:', divisionResponse.data);
      const daec = divisionResponse.data.find((div) => div.name === 'DAI');
      if (!daec) {
        setError('DAEC division not found');
        return;
      }
      console.log('DAEC division:', daec);
      setDivision(daec);

      // Fetch employees
      const employeeResponse = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Employees response:', employeeResponse.data);

      // Filter employees
      const filteredEmployees = employeeResponse.data.filter((emp) => {
        const divisionId = emp.divisionId?._id || emp.divisionId;
        console.log(`Employee ${emp.nomComplet}: divisionId=${divisionId}, daec._id=${daec._id}`);
        return divisionId === daec._id || divisionId?.toString() === daec._id.toString();
      });
      console.log('Filtered employees:', filteredEmployees);
      setEmployees(filteredEmployees);

      if (filteredEmployees.length === 0) {
        setError('No employees found for DAI');
      }
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
      console.error('Fetch error:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>DAEC Division</h2>
      {division && (
        <div className="mb-3">
          <strong>Name:</strong> {division.name}<br />
          <strong>Current Project:</strong> {division.currentProject || 'None'}
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Grade</th>
            <th>Mission</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.nomComplet}</td>
                <td>{employee.grade}</td>
                <td>{employee.missionPoste}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No employees available
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default DAIPage;