import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { api } from './api';
import Home from './pages/Home';
import RoleBasedLogin from './pages/RoleBasedLogin';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PostProperty from './pages/PostProperty';
import AdminDashboard from './pages/AdminDashboard';
import RequestPage from './pages/RequestPage';
import AllProperties from './pages/AllProperties';
import PropertyDetail from './pages/PropertyDetail';
import BookingPage from './pages/BookingPage';

function Layout({ children, currentUser }) {
  const location = useLocation();

  // If user is admin and not on admin routes, redirect to admin dashboard
  React.useEffect(() => {
    if (currentUser?.isAdmin && !location.pathname.startsWith('/admin') && location.pathname !== '/admin-login') {
      window.location.href = '/admin/dashboard';
    }
  }, [currentUser, location.pathname]);

  // If user is not admin and trying to access admin routes, redirect to home
  React.useEffect(() => {
    if (currentUser && !currentUser.isAdmin && location.pathname.startsWith('/admin')) {
      window.location.href = '/';
    }
  }, [currentUser, location.pathname]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">
          <span>{currentUser?.isAdmin ? 'Travyo Admin' : (currentUser ? 'PlanPackGo' : 'Travyo')}</span>
          <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#6b7280' }}>
            {currentUser?.isAdmin ? 'Admin Panel' : (currentUser ? 'Your Travel Hub' : 'Discover Paradise')}
          </span>
        </div>
        <nav className="nav-links">
          {!currentUser?.isAdmin && (
            <>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                Home
              </Link>
              <a href="#categories">Category</a>
              <Link to="/properties">Properties</Link>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
              <Link to="/request">Request</Link>
            </>
          )}
          {!currentUser && (
            <>
              <Link to="/login" className="secondary">
                Sign In
              </Link>
              <Link to="/register" className="primary">
                Sign Up
              </Link>
            </>
          )}
        </nav>
        {currentUser && !currentUser.isAdmin && (
          <div className="user-header">
            <div className="user-avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
            <span className="user-name">{currentUser.name}</span>
            <button className="logout-btn" onClick={() => { api.post('/api/auth/logout'); setCurrentUser(null); window.location.href = '/'; }}>Logout</button>
          </div>
        )}
        {currentUser?.isAdmin && (
          <div className="admin-header">
            <span className="admin-name">Admin: {currentUser.name}</span>
            <button className="logout-btn" onClick={() => { api.post('/api/auth/logout'); setCurrentUser(null); window.location.href = '/login'; }}>Logout</button>
          </div>
        )}
      </header>
      <main className="app-main">
        {currentUser && !currentUser.isAdmin && !isAdminRoute && (
          <aside className="user-sidebar">
            <nav className="user-nav">
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>Profile</Link>
              <Link to="/post-property" className={location.pathname === '/post-property' ? 'active' : ''}>Post Property</Link>
            </nav>
          </aside>
        )}
        <div className="app-content">{children}</div>
      </main>
      <footer className="app-footer">© {new Date().getFullYear()} Travyo · PlanPackGo</footer>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const location = useLocation();

  React.useEffect(() => {
    api.get('/api/auth/me')
      .then((res) => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null));
  }, [location.pathname]); // Refetch when route changes

  return (
    <Layout currentUser={currentUser}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<RoleBasedLogin />} />
        <Route path="/admin-login" element={<RoleBasedLogin />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Regular user routes */}
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<AllProperties />} />
        <Route path="/properties/:propertyId" element={<PropertyDetail />} />
        <Route path="/book/:propertyId" element={<BookingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post-property" element={<PostProperty />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

