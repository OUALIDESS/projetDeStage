import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email and password.');
      return;
    }
    try {
      console.log('Sending login request:', { email, password });
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.user.name); // Store "Admin User"
      navigate('/employees');
    } catch (error) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response?.status === 429) {
        setError('Too many login attempts. Please wait and try again.');
      } else if (error.response?.status === 400) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  const inputStyle = {
    border: 'none',
    borderBottom: '1px solid #ccc',
    padding: '0.5rem 0',
    outline: 'none',
    boxShadow: 'none',
    width: '100%',
    transition: 'all 0.3s ease',
  };

  return (
    <div className="container-fluid px-0" style={{ height: '100vh', overflowY: 'hidden' }}>
      <div className="row gx-0 h-100">
        <div className="col-md-6 d-flex align-items-center justify-content-center p-4 h-100">
          <div className="w-100" style={{ maxWidth: 400 }}>
            <h1 className="text-center mb-4 fw-bold">Projet de Synthèse</h1>
            <p className="text-center text-muted mb-4">Gestion des Ressources Humaines</p>

            <h4 className="mb-3">Welcome back!</h4>
            <p className="text-muted mb-4">Gérer les employés</p>

            {error && <p className="text-danger text-center">{error}</p>}

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </Form.Group>

              <Button variant="dark" type="submit" className="w-100 py-2 fw-semibold">
                Enter
              </Button>
            </Form>
          </div>
        </div>
        <div className="col-md-6 d-none d-md-block bg-light h-100"></div>
      </div>
    </div>
  );
};

export default Login;