import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table } from 'react-bootstrap';

const ChefDivisions = () => {
  const navigate = useNavigate();
  const [divisions, setDivisions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to access this page');
          navigate('/login');
          return;
        }

        const divisionRes = await axios.get('/api/divisions', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const divisionsWithCounts = await Promise.all(
          divisionRes.data.map(async (division) => {
            const employeeRes = await axios.get('/api/employees', {
              headers: { Authorization: `Bearer ${token}` },
              params: { ids: division.employeeIds.join(',') },
            });
            return {
              ...division,
              employeeCount: employeeRes.data.length,
            };
          })
        );

        setDivisions(divisionsWithCounts);
      } catch (err) {
        setError('Failed to fetch divisions');
        console.error('Error fetching divisions:', err);
      }
    };
    fetchDivisions();
  }, [navigate]);

  const handleRowClick = (divisionName) => {
    navigate(`/pages/divisions/${divisionName}`);
  };

  return (
    <div className="bg-white rounded-3 shadow-sm p-4 mx-auto" style={{ maxWidth: '1200px', margin: '20px' }}>
      {error && <p className="text-danger">{error}</p>}
      <h5 className="mb-4 fw-semibold">Vue d'ensemble des divisions</h5>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nom de la division</th>
            <th>Nombre d'employés</th>
          </tr>
        </thead>
        <tbody>
          {divisions.map((division) => (
            <tr
              key={division._id}
              onClick={() => handleRowClick(division.name)}
              style={{ cursor: 'pointer' }}
            >
              <td>{division.name}</td>
              <td>{division.employeeCount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ChefDivisions;