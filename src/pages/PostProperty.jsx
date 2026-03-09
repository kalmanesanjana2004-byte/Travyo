import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import './PostProperty.css';

export default function PostProperty() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    location: '',
    category: '',
    price: '',
    rating: '',
    imageUrl: '',
    images: [],
    description: '',
    features: '',
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(
      files.map((file) =>
        new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.readAsDataURL(file);
        })
      )
    ).then((data) => setForm((f) => ({ ...f, images: data })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      await api.post('/api/properties', payload);
      alert('Property submitted');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <section className="dashboard">
      <h1 className="page-title">Post Your Property</h1>
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/dashboard">Dashboard</Link> / <span>Post Property</span>
      </div>
      <div className="form-container">
        <form className="property-form" onSubmit={handleSubmit}>
          <label>
            Property Name *
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Location *
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Click to select location on map"
              required
            />
          </label>
          <button type="button" className="map-btn" onClick={() => alert('Map selector not implemented')}>Select on Map</button>

          <label>
            Category *
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              <option value="hotels">Hotels</option>
              <option value="resort">Resort</option>
              <option value="homestay">Homestay</option>
              <option value="nature">Nature</option>
            </select>
          </label>
          <label>
            Price (per night) *
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </label>
          <label>
            Rating *
            <input
              type="number"
              step="0.1"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              required
            />
          </label>

          <label>
            Upload Photos (4-5 photos) *
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
          </label>
          <p className="help-text">You can upload up to 5 photos. Supported formats: JPG, PNG, GIF, WEBP</p>

          <label>
            Or Image URL (Alternative)
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="help-text">If you don't upload files, you can provide an image URL instead</p>
          </label>

          <label>
            Description *
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </label>
          <label>
            Features (comma-separated) *
            <input
              type="text"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="e.g., Pool, Spa, Beach Access"
              required
            />
            <p className="help-text">Separate multiple features with commas</p>
          </label>

          <div className="form-actions">
            <button type="submit" className="btn primary">Submit Property</button>
            <button type="button" className="btn secondary" onClick={() => navigate('/dashboard')}>Clear</button>
          </div>
        </form>
      </div>
    </section>
  );
}
