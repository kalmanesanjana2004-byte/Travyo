import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function RoleBasedLogin() {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // 'user' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill demo credentials for admin role
  React.useEffect(() => {
    if (role === 'admin') {
      setEmail('admin@travyo.com');
      setPassword('admin123');
      setError('');
    } else {
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [role]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });

      // Check if the role matches the login attempt
      if (role === 'admin') {
        if (!response.data.isAdmin) {
          setError('Invalid admin credentials. This account is not an admin account.');
          setLoading(false);
          return;
        }
        navigate('/admin/dashboard');
      } else {
        if (response.data.isAdmin) {
          setError('Admin accounts cannot log in as regular users. Please use the admin login.');
          setLoading(false);
          return;
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || `${role === 'admin' ? 'Admin' : 'User'} login failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <h1 className="page-title">Login</h1>

      {/* Role Selection Tabs */}
      <div className="role-tabs-container">
        <button
          className={`role-tab-btn ${role === 'user' ? 'active' : ''}`}
          onClick={() => setRole('user')}
          type="button"
        >
          User Login
        </button>
        <button
          className={`role-tab-btn ${role === 'admin' ? 'active' : ''}`}
          onClick={() => setRole('admin')}
          type="button"
        >
          Admin Login
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        {error && <p className="error">{error}</p>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={role === 'admin' ? 'admin@travyo.com' : 'your@email.com'}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </label>

        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Logging in…' : `Login as ${role === 'admin' ? 'Admin' : 'User'}`}
        </button>

        <p className="muted">
          Don&apos;t have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </section>
  );
}
