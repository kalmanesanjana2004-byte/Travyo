import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/properties', { params: { limit: 6 } });
        setProperties(res.data || []);
      } catch (e) {
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/properties?location=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Explore smart. Travel cheap. Plan with ease.</h1>
          <p className="hero-subtitle">
            Your intelligent travel planner for budget‑friendly adventures. Discover curated stays,
            manage bookings, and keep your plans in one place.
          </p>
          <form className="hero-search" onSubmit={onSearch}>
            <input
              placeholder="Where do you want to go?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <section className="page-section" id="categories">
        <h2 className="page-title">Category</h2>
        <p className="page-subtitle">
          Explore our curated collection of amazing stays around the world.
        </p>
        <div className="category-grid">
          <div className="category-card" onClick={() => navigate('/properties?category=resort')} style={{ cursor: 'pointer' }}>
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
              alt="Resort"
            />
            <div className="category-card-body">
              <h3>Resort</h3>
              <p className="muted">Relax in luxury beachfront and mountain resorts.</p>
            </div>
          </div>
          <div className="category-card" onClick={() => navigate('/properties?category=homestay')} style={{ cursor: 'pointer' }}>
            <img
              src="https://images.unsplash.com/photo-1600585154340-0ef3c08c0632?auto=format&fit=crop&w=800&q=80"
              alt="Homestay"
            />
            <div className="category-card-body">
              <h3>Homestay</h3>
              <p className="muted">Live like a local with warm, hosted stays.</p>
            </div>
          </div>
          <div className="category-card" onClick={() => navigate('/properties?category=hotels')} style={{ cursor: 'pointer' }}>
            <img
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
              alt="Hotels"
            />
            <div className="category-card-body">
              <h3>Hotels</h3>
              <p className="muted">Business‑ready hotels in top city locations.</p>
            </div>
          </div>
          <div className="category-card" onClick={() => navigate('/properties?category=nature')} style={{ cursor: 'pointer' }}>
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
              alt="Nature stay"
            />
            <div className="category-card-body">
              <h3>Nature Stay</h3>
              <p className="muted">Cabins, treehouses, and eco‑lodges in nature.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <h2 className="page-title">Featured Properties</h2>
        <p className="page-subtitle">Hand‑picked stays to get you started.</p>
        {loading && <p>Loading properties…</p>}
        {error && <p className="error">{error}</p>}
        <div className="cards-grid">
          {properties.map((p) => (
            <article key={p._id || p.propertyId} className="card">
              <div className="card-image-wrapper">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} />
                ) : (
                  <div className="card-image-placeholder">No image</div>
                )}
              </div>
              <div className="card-body">
                <h2>{p.name}</h2>
                <p className="muted">
                  {p.location} · {p.category}
                </p>
                <p className="price">
                  ₹{p.price}{' '}
                  <span className="muted" style={{ fontWeight: 400 }}>
                    / night
                  </span>
                </p>
                {p.rating != null && (
                  <p className="rating">
                    ⭐ {Number(p.rating).toFixed(1)}
                  </p>
                )}
                <button
                  type="button"
                  className="btn small"
                  onClick={() => navigate(`/properties/${p.propertyId}`)}
                >
                  View Details
                </button>
              </div>
            </article>
          ))}
          {!loading && !error && properties.length === 0 && (
            <p className="muted">No properties yet. Add one from admin or dashboard.</p>
          )}
        </div>
      </section>

      <section className="page-section" id="about">
        <h2 className="page-title">About PlanPackGo</h2>
        <p className="page-subtitle">
          PlanPackGo is your intelligent travel companion, designed to make trip planning simple,
          smart, and budget‑friendly.
        </p>
      </section>

      <section className="page-section" id="contact">
        <h2 className="page-title">Contact us</h2>
        <p className="page-subtitle">
          Have a question or special request? Reach out and our team will help you plan the perfect
          trip.
        </p>
      </section>
    </>
  );
}

