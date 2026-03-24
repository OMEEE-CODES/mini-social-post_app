import React, { useState } from 'react';
import { Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { BsFillPeopleFill } from 'react-icons/bs';

const API_BASE = 'http://localhost:5001';

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signup`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const { token, user } = res.data;
      login(token, user);
      navigate('/', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <Card.Body>
          {/* Logo */}
          <div className="text-center mb-4">
            <div className="auth-logo d-flex align-items-center justify-content-center gap-2">
              <BsFillPeopleFill size={28} style={{ color: '#6ea8fe' }} />
              Social<span>Post</span>
            </div>
            <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.9rem' }}>
              Join the community. Create your account.
            </p>
          </div>

          {serverError && (
            <Alert variant="danger" className="form-error-alert">
              {serverError}
            </Alert>
          )}

          <Form noValidate onSubmit={handleSubmit}>
            {/* Full Name */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                <FiUser size={14} className="me-1" />
                Full Name
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                isInvalid={Boolean(errors.name)}
                autoComplete="name"
                style={{ borderRadius: '10px' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                <FiMail size={14} className="me-1" />
                Email address
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                isInvalid={Boolean(errors.email)}
                autoComplete="email"
                style={{ borderRadius: '10px' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                <FiLock size={14} className="me-1" />
                Password
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                isInvalid={Boolean(errors.password)}
                autoComplete="new-password"
                style={{ borderRadius: '10px' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                <FiLock size={14} className="me-1" />
                Confirm Password
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={Boolean(errors.confirmPassword)}
                autoComplete="new-password"
                style={{ borderRadius: '10px' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
              style={{ borderRadius: '10px', fontWeight: 600, padding: '10px' }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" />
                  Creating account...
                </>
              ) : (
                <>
                  <FiUserPlus size={16} />
                  Create Account
                </>
              )}
            </Button>
          </Form>

          <hr className="my-4" />

          <p className="text-center mb-0 auth-divider">
            Already have an account?{' '}
            <Link to="/login" className="fw-semibold text-decoration-none">
              Sign in
            </Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Signup;
