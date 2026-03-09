import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@travyo.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      // Check if user is admin
      if (response.data.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        setError('Admin access required');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <h1 className="page-title">Admin Login</h1>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form className="auth-form" onSubmit={onSubmit}>
          {error && <p className="error">{error}</p>}
          <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0' }}>
              Default Credentials:
            </p>
            <p style={{ fontSize: '0.85rem', color: '#999', margin: '5px 0 0 0' }}>
              Email: admin@travyo.com
            </p>
            <p style={{ fontSize: '0.85rem', color: '#999', margin: '2px 0 0 0' }}>
              Password: admin123
            </p>
          </div>
          <label>
            Admin Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Admin Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Logging in…' : 'Admin Login'}
          </button>
          <p className="muted" style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href="/login" style={{ color: '#0066cc', textDecoration: 'none' }}>Back to User Login</a>
          </p>
        </form>
      </div>
    </section>
  );
}
