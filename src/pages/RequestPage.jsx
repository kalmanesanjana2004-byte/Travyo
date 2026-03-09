import React, { useState } from 'react';
import { api } from '../api';

export default function RequestPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    requestType: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    try {
      await api.post('/api/requests', form);
      setStatus('Your request has been submitted. We will get back to you soon.');
      setForm({
        name: '',
        email: '',
        phone: '',
        requestType: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <h1 className="page-title">Travel request</h1>
      <form className="auth-form" onSubmit={onSubmit}>
        {error && <p className="error">{error}</p>}
        {status && <p className="success">{status}</p>}
        <label>
          Name
          <input name="name" value={form.name} onChange={onChange} required />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={onChange} required />
        </label>
        <label>
          Request type
          <input
            name="requestType"
            value={form.requestType}
            onChange={onChange}
            placeholder="Hotel, flight, package…"
            required
          />
        </label>
        <label>
          Subject
          <input name="subject" value={form.subject} onChange={onChange} required />
        </label>
        <label>
          Message
          <textarea
            name="message"
            rows={4}
            value={form.message}
            onChange={onChange}
            required
          />
        </label>
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Sending…' : 'Submit request'}
        </button>
      </form>
    </section>
  );
}

