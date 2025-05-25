import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, LabelList
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949'];

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

const cardStyle = {
  borderRadius: "15px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  cursor: "default",
};

const cardHoverStyle = {
  transform: "translateY(-5px)",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.18)",
};

const Dashboard = () => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch divisions and employees
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

        // Total Employees
        const totalEmployees = employees.length;

        // Employees by Division
        const employeesByDivision = divisions.map(division => ({
          name: division.name,
          value: division.employeeIds.length,
        }));

        // Gender Distribution
        const genderDistribution = [
          { name: 'Hommes', value: employees.filter(emp => emp.sexe === 'Homme').length },
          { name: 'Femmes', value: employees.filter(emp => emp.sexe === 'Femme').length },
        ];

        // Grade Distribution
        const gradeCounts = employees.reduce((acc, emp) => {
          acc[emp.grade] = (acc[emp.grade] || 0) + 1;
          return acc;
        }, {});
        const gradeDistribution = Object.entries(gradeCounts).map(([name, value]) => ({
          name,
          value,
        }));

        // Age Distribution
        const currentYear = new Date().getFullYear();
        const ageDistribution = [
          { ageGroup: '<30', hommes: 0, femmes: 0 },
          { ageGroup: '30-40', hommes: 0, femmes: 0 },
          { ageGroup: '41-50', hommes: 0, femmes: 0 },
          { ageGroup: '>50', hommes: 0, femmes: 0 },
        ];

        employees.forEach(emp => {
          const birthYear = new Date(emp.dateNaissance).getFullYear();
          const age = currentYear - birthYear;
          let ageGroup;
          if (age < 30) ageGroup = '<30';
          else if (age <= 40) ageGroup = '30-40';
          else if (age <= 50) ageGroup = '41-50';
          else ageGroup = '>50';

          const group = ageDistribution.find(g => g.ageGroup === ageGroup);
          if (emp.sexe === 'Homme') group.hommes += 1;
          else if (emp.sexe === 'Femme') group.femmes += 1;
        });

        setDashboardData({
          totalEmployees,
          employeesByDivision,
          genderDistribution,
          gradeDistribution,
          ageDistribution,
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

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  return (
    <Container
      className="mt-4"
      style={{ maxWidth: "1100px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <h2
        className="text-center mb-4"
        style={{ fontWeight: "700", color: "#3a3a3a", letterSpacing: "1.2px" }}
      >
        Tableau de Bord RH
      </h2>

      <Row className="mb-3">
        <Col xs={12} md={4} className="d-flex flex-column gap-3">
          <Card
            className="text-center p-3 flex-grow-1"
            style={hoverIndex === 0 ? { ...cardStyle, ...cardHoverStyle } : cardStyle}
            onMouseEnter={() => setHoverIndex(0)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <Card.Body>
              <Card.Title style={{ color: "#4e79a7", fontWeight: "600" }}>
                Total des Employés
              </Card.Title>
              <h2 className="mt-2" style={{ color: "#1c3d72", fontWeight: "700" }}>
                {dashboardData.totalEmployees}
              </h2>
            </Card.Body>
          </Card>

          <Card
            className="text-center p-3 flex-grow-1"
            style={hoverIndex === 1 ? { ...cardStyle, ...cardHoverStyle } : cardStyle}
            onMouseEnter={() => setHoverIndex(1)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <Card.Body>
              <Card.Title style={{ color: "#59a14f", fontWeight: "600" }}>
                Nombre de Divisions
              </Card.Title>
              <h2 className="mt-2" style={{ color: "#3c6e3c", fontWeight: "700" }}>
                {dashboardData.employeesByDivision.length}
              </h2>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={8}>
          <Card className="p-3 mb-3" style={{ ...cardStyle }}>
            <Card.Title style={{ fontWeight: "600", color: "#4e79a7" }}>
              Répartition des Employés par Division
            </Card.Title>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={dashboardData.employeesByDivision}
                margin={{ top: 10, right: 15, left: 0, bottom: 10 }}
              >
                <XAxis dataKey="name" fontSize={12} stroke="#6c757d" />
                <YAxis fontSize={12} stroke="#6c757d" />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#4e79a7" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" fill="#4e79a7" barSize={26} radius={[5, 5, 0, 0]}>
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(val) => `${val} (${((val / dashboardData.totalEmployees) * 100).toFixed(0)}%)`}
                    fontSize={11}
                    fill="#333"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row>
        {[{
          title: "Répartition Femmes / Hommes",
          dataKey: dashboardData.genderDistribution,
          colorIndex: 0,
        }, {
          title: "Répartition par Échelle (Grade)",
          dataKey: dashboardData.gradeDistribution,
          colorIndex: 2,
        }].map(({ title, dataKey, colorIndex }, i) => (
          <Col xs={12} md={6} key={i}>
            <Card className="p-3 mb-3" style={{ ...cardStyle }}>
              <Card.Title style={{ fontWeight: "600", color: COLORS[colorIndex] }}>
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
                  <Tooltip contentStyle={{ borderRadius: 10, borderColor: COLORS[colorIndex] }} />
                  <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col xs={12}>
          <Card className="p-3 mb-3" style={{ ...cardStyle }}>
            <Card.Title style={{ fontWeight: "600", color: "#4e79a7" }}>
              Pyramide des Âges par Sexe
            </Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboardData.ageDistribution}
                layout="vertical"
                margin={{ top: 15, right: 20, left: 40, bottom: 15 }}
              >
                <XAxis type="number" fontSize={12} stroke="#6c757d" />
                <YAxis dataKey="ageGroup" type="category" tick={{ fontSize: 12 }} width={70} stroke="#6c757d" />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#4e79a7" }} />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="hommes" name="Hommes" fill="#4e79a7" barSize={20} radius={[5, 5, 5, 5]} />
                <Bar dataKey="femmes" name="Femmes" fill="#f28e2b" barSize={20} radius={[5, 5, 5, 5]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;