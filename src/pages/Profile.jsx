import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data);
        setForm({ name: res.data.name, email: res.data.email, phone: res.data.phone || '' });
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/update', form);
      alert('Profile updated');
      setUser((u) => ({ ...u, ...form }));
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  if (loading) {
    return <p>Loading…</p>;
  }
  if (!user) return null;

  return (
    <section className="dashboard">
      <h1 className="page-title">Edit Profile</h1>
      <div className="breadcrumb">
        <Link to="/dashboard">Dashboard</Link> / <span>Profile</span>
      </div>
      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Full Name *
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Email Address *
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          Phone (Optional)
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn primary">Save Changes</button>
          <Link to="/dashboard" className="btn secondary">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
