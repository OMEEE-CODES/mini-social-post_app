import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import { BsFillPeopleFill } from 'react-icons/bs';

const AppNavbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar className="app-navbar" sticky="top" expand="lg">
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center gap-2">
          <BsFillPeopleFill size={22} style={{ color: '#a8d8ff' }} />
          Social<span>Post</span>
        </Navbar.Brand>

        {isAuthenticated && (
          <div className="d-flex align-items-center gap-3 ms-auto">
            <span
              className="text-white d-none d-sm-inline"
              style={{ fontSize: '0.875rem', opacity: 0.9 }}
            >
              👋 {user?.name || 'User'}
            </span>
            <Button
              variant="outline-light"
              size="sm"
              onClick={handleLogout}
              className="d-flex align-items-center gap-1"
              style={{ borderRadius: '20px', fontWeight: 500 }}
            >
              <FiLogOut size={15} />
              <span className="d-none d-sm-inline">Logout</span>
            </Button>
          </div>
        )}
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
