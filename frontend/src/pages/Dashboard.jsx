import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, LabelList
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";

const COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949'];

const data = {
  totalEmployees: 150,
  employeesByDivision: [
    { name: 'DAEC', value: 30 },
    { name: 'DAI', value: 25 },
    { name: 'DAS', value: 20 },
    { name: 'DCT', value: 15 },
    { name: 'DFL', value: 10 },
    { name: 'DPE', value: 5 },
    { name: 'DRHF', value: 25 },
    { name: 'DUE', value: 20 },
  ],
  genderDistribution: [
    { name: 'Hommes', value: 80 },
    { name: 'Femmes', value: 70 },
  ],
  contractTypeDistribution: [
    { name: 'CDI', value: 100 },
    { name: 'CDD', value: 30 },
    { name: 'Stage', value: 20 },
  ],
  gradeDistribution: [
    { name: 'Cadre', value: 50 },
    { name: 'Non Cadre', value: 100 },
  ],
  ageDistribution: [
    { ageGroup: '<30', hommes: 20, femmes: 15 },
    { ageGroup: '30-40', hommes: 25, femmes: 20 },
    { ageGroup: '41-50', hommes: 20, femmes: 25 },
    { ageGroup: '>50', hommes: 15, femmes: 10 },
  ],
  seniorityDistribution: [
    { years: '<1 an', value: 30 },
    { years: '1-3 ans', value: 40 },
    { years: '3-5 ans', value: 35 },
    { years: '>5 ans', value: 45 },
  ],
};

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
  const [hoverIndex, setHoverIndex] = React.useState(null);

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
          {/* Total des Employés */}
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
                {data.totalEmployees}
              </h2>
            </Card.Body>
          </Card>

          {/* Nombre de Divisions */}
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
                {data.employeesByDivision.length}
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
                data={data.employeesByDivision}
                margin={{ top: 10, right: 15, left: 0, bottom: 10 }}
              >
                <XAxis dataKey="name" fontSize={12} stroke="#6c757d" />
                <YAxis fontSize={12} stroke="#6c757d" />
                <Tooltip
                  contentStyle={{ borderRadius: 10, borderColor: "#4e79a7" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" fill="#4e79a7" barSize={26} radius={[5, 5, 0, 0]}>
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(val) => `${val} (${((val / data.totalEmployees) * 100).toFixed(0)}%)`}
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
          dataKey: data.genderDistribution,
          colorIndex: 0,
        }, {
          title: "Répartition par Type de Contrat",
          dataKey: data.contractTypeDistribution,
          colorIndex: 1,
        }, {
          title: "Répartition par Grade",
          dataKey: data.gradeDistribution,
          colorIndex: 2,
        }].map(({ title, dataKey, colorIndex }, i) => (
          <Col xs={12} md={4} key={i}>
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
                  <Tooltip
                    contentStyle={{ borderRadius: 10, borderColor: COLORS[colorIndex] }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col xs={12} md={6}>
          <Card className="p-3 mb-3" style={{ ...cardStyle }}>
            <Card.Title style={{ fontWeight: "600", color: "#4e79a7" }}>
              Pyramide des Âges par Sexe
            </Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={data.ageDistribution}
                layout="vertical"
                margin={{ top: 15, right: 20, left: 40, bottom: 15 }}
              >
                <XAxis type="number" fontSize={12} stroke="#6c757d" />
                <YAxis
                  dataKey="ageGroup"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={70}
                  stroke="#6c757d"
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, borderColor: "#4e79a7" }}
                />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="hommes" name="Hommes" fill="#4e79a7" barSize={10} radius={[5, 5, 5, 5]} />
                <Bar dataKey="femmes" name="Femmes" fill="#f28e2b" barSize={10} radius={[5, 5, 5, 5]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="p-3 mb-3" style={{ ...cardStyle }}>
            <Card.Title style={{ fontWeight: "600", color: "#59a14f" }}>
              Ancienneté des Employés
            </Card.Title>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={data.seniorityDistribution}
                margin={{ top: 15, right: 20, left: 20, bottom: 15 }}
              >
                <XAxis dataKey="years" fontSize={12} stroke="#6c757d" />
                <YAxis fontSize={12} stroke="#6c757d" />
                <Tooltip
                  contentStyle={{ borderRadius: 10, borderColor: "#59a14f" }}
                />
                <Bar
                  dataKey="value"
                  fill="#59a14f"
                  barSize={26}
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    fontSize={11}
                    fill="#333"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
