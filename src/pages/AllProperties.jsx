import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function AllProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const locationFilter = query.get('location') || undefined;
        const categoryFilter = query.get('category') || undefined;
        const res = await api.get('/api/properties', {
          params: { location: locationFilter, category: categoryFilter },
        });
        setProperties(res.data || []);
      } catch (e) {
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query]);

  const locationFilter = query.get('location');
  const categoryFilter = query.get('category');

  const getPageTitle = () => {
    if (categoryFilter) {
      return `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Properties`;
    }
    if (locationFilter) {
      return `Properties in ${locationFilter}`;
    }
    return 'All Properties';
  };

  const getPageSubtitle = () => {
    if (categoryFilter || locationFilter) {
      return `Showing ${categoryFilter || 'all'} properties${locationFilter ? ` in ${locationFilter}` : ''}.`;
    }
    return 'Explore our curated collection of amazing stays around the world.';
  };

  const clearFilters = () => {
    navigate('/properties');
  };

  return (
    <section className="page-section">
      <h1 className="page-title">{getPageTitle()}</h1>
      <p className="page-subtitle">
        {getPageSubtitle()}
        {(categoryFilter || locationFilter) && (
          <button
            type="button"
            onClick={clearFilters}
            className="btn small"
            style={{ marginLeft: '10px', fontSize: '0.9em' }}
          >
            Clear Filters
          </button>
        )}
      </p>
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
      </div>
      {!loading && !error && properties.length === 0 && (
        <p className="muted">No properties found. Try adjusting your filters.</p>
      )}
    </section>
  );
}

