import React, { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, LabelList
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7'];

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      fontSize={11}
      fontWeight="600"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const Dashboard = ({ theme = "light" }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [divisionsResponse, employeesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/divisions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/divisions/employees', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const divisions = divisionsResponse.data;
        const employees = employeesResponse.data;

        setDashboardData({
          totalEmployees: employees.length,
          divisions: divisions,
          employees: employees,
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err.response?.data || err);
        setError('Failed to load dashboard data: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const employeesByDivision = useMemo(() => {
    if (!dashboardData?.divisions || !dashboardData?.employees) return [];
    return dashboardData.divisions.map(division => ({
      name: division.name,
      value: division.employeeIds.length,
    }));
  }, [dashboardData]);

  const genderDistribution = useMemo(() => {
    if (!dashboardData?.employees) return [];
    const counts = dashboardData.employees.reduce((acc, emp) => {
      if (emp.sexe === 'Homme') acc['Homme'] = (acc['Homme'] || 0) + 1;
      if (emp.sexe === 'Femme') acc['Femme'] = (acc['Femme'] || 0) + 1;
      return acc;
    }, { Homme: 0, Femme: 0 });
    return [
      { name: 'Hommes', value: counts['Homme'] },
      { name: 'Femmes', value: counts['Femme'] },
    ];
  }, [dashboardData]);

  const gradeDistribution = useMemo(() => {
    if (!dashboardData?.employees) return [];
    const gradeCounts = dashboardData.employees.reduce((acc, emp) => {
      const grade = emp.grade === '' || emp.grade === null || emp.grade === undefined ? 'Non spécifié' : emp.grade;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(gradeCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [dashboardData]);

  const ageDistribution = useMemo(() => {
    if (!dashboardData?.employees) return [];
    const currentYear = new Date().getFullYear();
    const ageGroups = [
      { ageGroup: '<30', hommes: 0, femmes: 0 },
      { ageGroup: '30-40', hommes: 0, femmes: 0 },
      { ageGroup: '41-50', hommes: 0, femmes: 0 },
      { ageGroup: '>50', hommes: 0, femmes: 0 },
    ];

    dashboardData.employees.forEach(emp => {
      const birthYear = new Date(emp.dateNaissance).getFullYear();
      if (isNaN(birthYear)) return;
      const age = currentYear - birthYear;
      let ageGroup;
      if (age < 30) ageGroup = '<30';
      else if (age <= 40) ageGroup = '30-40';
      else if (age <= 50) ageGroup = '41-50';
      else ageGroup = '>50';

      const group = ageGroups.find(g => g.ageGroup === ageGroup);
      if (emp.sexe === 'Homme') group.hommes += 1;
      else if (emp.sexe === 'Femme') group.femmes += 1;
    });

    return ageGroups;
  }, [dashboardData]);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  if (!dashboardData || dashboardData.totalEmployees === 0) {
    return <Alert variant="info" className="m-3">Aucune donnée disponible pour afficher les graphiques.</Alert>;
  }

  const cardStyle = {
    borderRadius: "15px",
    boxShadow: theme === 'dark' ? "0 4px 20px rgba(0, 0, 0, 0.5)" : "0 4px 20px rgba(0, 0, 0, 0.12)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#3a3a4a' : '#dee2e6'}`,
  };

  const cardHoverStyle = {
    transform: "translateY(-5px)",
    boxShadow: theme === 'dark' ? "0 8px 30px rgba(0, 0, 0, 0.7)" : "0 8px 30px rgba(0, 0, 0, 0.18)",
  };

  return (
    <>
      <style>
        {`
          .dashboard-container {
            background-color: ${theme === 'dark' ? '#14131f' : '#ffffff'};
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
            padding: 2rem;
            min-height: 100vh;
            position: relative;
          }

          .dashboard-title {
            color: ${theme === 'dark' ? '#e0e0e0' : '#3a3a3a'};
          }

          .card-title {
            color: ${theme === 'dark' ? '#a0a0a0' : '#4e79a7'};
          }

          .card-value {
            color: ${theme === 'dark' ? '#ffffff' : '#1c3d72'};
          }

          .card-value-alt {
            color: ${theme === 'dark' ? '#ffffff' : '#3c6e3c'};
          }

          .tooltip-custom {
            background-color: ${theme === 'dark' ? '#2a2a3a' : '#ffffff'};
            border: 1px solid ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'};
            border-radius: 10px;
            color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
          }

          .alert-danger {
            background-color: ${theme === 'dark' ? '#7f1d1d' : '#f8d7da'};
            color: ${theme === 'dark' ? '#f9a8a8' : '#721c24'};
            border-color: ${theme === 'dark' ? '#991b1b' : '#f5c6cb'};
          }
        `}
      </style>
      <Container
        className="dashboard-container mt-4"
        style={{ maxWidth: "1100px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
      >
        <h2
          className="dashboard-title text-center mb-4"
          style={{ fontWeight: "700", letterSpacing: "1.2px" }}
        >
          Tableau de Bord RH
        </h2>

        <Row className="mb-3">
          <Col xs={12} md={6} className="mb-3 mb-md-0">
            <Card
              className="text-center p-3"
              style={hoverIndex === 0 ? { ...cardStyle, ...cardHoverStyle } : cardStyle}
              onMouseEnter={() => setHoverIndex(0)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <Card.Body>
                <Card.Title className="card-title" style={{ fontWeight: "600" }}>
                  Total des Employés
                </Card.Title>
                <h2 className="card-value mt-2" style={{ fontWeight: "700" }}>
                  {dashboardData.totalEmployees}
                </h2>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card
              className="text-center p-3"
              style={hoverIndex === 1 ? { ...cardStyle, ...cardHoverStyle } : cardStyle}
              onMouseEnter={() => setHoverIndex(1)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <Card.Body>
                <Card.Title className="card-title" style={{ fontWeight: "600", color: theme === 'dark' ? '#a0a0a0' : '#59a14f' }}>
                  Nombre de Divisions
                </Card.Title>
                <h2 className="card-value-alt mt-2" style={{ fontWeight: "700" }}>
                  {dashboardData.divisions.length}
                </h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col xs={12}>
            <Card
              className="p-3"
              style={hoverIndex === 2 ? { ...cardStyle, ...cardHoverStyle } : cardStyle}
              onMouseEnter={() => setHoverIndex(2)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <Card.Title className="card-title" style={{ fontWeight: "600" }}>
                Répartition des Employés par Division
              </Card.Title>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={employeesByDivision}
                  margin={{ top: 10, right: 15, left: 0, bottom: 10 }}
                >
                  <XAxis dataKey="name" fontSize={12} stroke={theme === 'dark' ? '#a0a0a0' : '#6c757d'} />
                  <YAxis fontSize={12} stroke={theme === 'dark' ? '#a0a0a0' : '#6c757d'} />
                  <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#4e79a7" }} wrapperStyle={{ outline: "none" }} className="tooltip-custom" />
                  <Legend wrapperStyle={{ fontSize: 12, color: theme === 'dark' ? '#e0e0e0' : '#212529' }} />
                  <Bar dataKey="value" fill="#4e79a7" barSize={26} radius={[5, 5, 0, 0]}>
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(val) => `${val} (${((val / dashboardData.totalEmployees) * 100).toFixed(0)}%)`}
                      fontSize={11}
                      fill={theme === 'dark' ? '#e0e0e0' : '#333'}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row className="mb-3">
          {[{
            title: "Répartition Femmes / Hommes",
            dataKey: genderDistribution,
            colorIndex: 0,
            hoverIdx: 3,
          }, {
            title: "Répartition par Échelle (Grade)",
            dataKey: gradeDistribution,
            colorIndex: 2,
            hoverIdx: 4,
          }].map(({ title, dataKey, colorIndex, hoverIdx }, i) => (
            <Col xs={12} md={6} key={i} className="mb-3 mb-md-0">
              <Card
                className="p-3"
                style={hoverIndex === hoverIdx ? { ...cardStyle, ...cardHoverStyle } : cardStyle}
                onMouseEnter={() => setHoverIndex(hoverIdx)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <Card.Title className="card-title" style={{ fontWeight: "600" }}>
                  {title}
                </Card.Title>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={dataKey}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label={renderPieLabel}
                      labelLine={false}
                      cornerRadius={5}
                    >
                      {dataKey.map((entry, index) => (
                        <Cell
                          key={`cell-${title}-${index}`}
                          fill={COLORS[(colorIndex + index) % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, borderColor: COLORS[colorIndex] }} wrapperStyle={{ outline: "none" }} className="tooltip-custom" />
                    <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: 11, color: theme === 'dark' ? '#e0e0e0' : '#212529' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mb-3">
          <Col xs={12}>
            <Card
              className="p-3"
              style={hoverIndex === 5 ? { ...cardStyle, ...cardHoverStyle } : cardStyle}
              onMouseEnter={() => setHoverIndex(5)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <Card.Title className="card-title" style={{ fontWeight: "600" }}>
                Pyramide des Âges par Sexe
              </Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={ageDistribution}
                  layout="vertical"
                  margin={{ top: 15, right: 20, left: 40, bottom: 15 }}
                >
                  <XAxis type="number" fontSize={12} stroke={theme === 'dark' ? '#a0a0a0' : '#6c757d'} />
                  <YAxis dataKey="ageGroup" type="category" tick={{ fontSize: 12 }} width={70} stroke={theme === 'dark' ? '#a0a0a0' : '#6c757d'} />
                  <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#4e79a7" }} wrapperStyle={{ outline: "none" }} className="tooltip-custom" />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 11, color: theme === 'dark' ? '#e0e0e0' : '#212529' }} />
                  <Bar dataKey="hommes" name="Hommes" fill="#4e79a7" barSize={20} radius={[5, 5, 5, 5]} />
                  <Bar dataKey="femmes" name="Femmes" fill="#f28e2b" barSize={20} radius={[5, 5, 5, 5]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;