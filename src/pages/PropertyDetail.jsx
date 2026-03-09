import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function PropertyDetail() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/properties/${propertyId}`);
        const p = res.data;
        setProperty(p);
        const images = Array.isArray(p.images) && p.images.length ? p.images : [p.imageUrl];
        setActiveImage(images[0]);
      } catch {
        setProperty(null);
      }
    };
    load();
  }, [propertyId]);

  if (!property) {
    return (
      <section className="page-section">
        <h1 className="page-title">Property not found</h1>
      </section>
    );
  }

  const images = Array.isArray(property.images) && property.images.length
    ? property.images
    : [property.imageUrl].filter(Boolean);

  const pricePerNight = Number(property.price) || 0;
  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalPrice = pricePerNight * nights * rooms;

  const onBook = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setBookingError('Please select check-in and check-out dates.');
      return;
    }
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
      rooms: rooms.toString(),
      specialRequests,
    });
    navigate(`/book/${propertyId}?${params.toString()}`);
  };

  return (
    <section className="property-layout">
      <div>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn small"
          style={{ marginBottom: '0.9rem' }}
        >
          ← Back to Properties
        </button>
        <h1 className="page-title" style={{ marginBottom: '0.4rem' }}>
          {property.name}
        </h1>
        <p className="muted">
          {property.location} · {property.category}{' '}
          {property.rating != null && `· ⭐ ${Number(property.rating).toFixed(1)}`}
        </p>

        <div className="property-gallery-main">
          {activeImage ? (
            <img src={activeImage} alt={property.name} />
          ) : (
            <div className="card-image-placeholder">No image</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="property-thumbs">
            {images.map((img) => (
              <button
                type="button"
                key={img}
                className={`property-thumb ${img === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt={property.name} />
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>About this property</h2>
          <p className="muted">{property.description || 'Great stay for your next trip.'}</p>

          {property.features && (
            <>
              <h3 style={{ fontSize: '0.98rem', marginTop: '1rem', marginBottom: '0.3rem' }}>
                Facilities &amp; amenities
              </h3>
              <p className="muted">{property.features}</p>
            </>
          )}
        </div>
      </div>

      <aside className="booking-panel">
        <div>
          <span className="price">
            ₹{pricePerNight.toFixed(2)}
            <span className="muted"> / night</span>
          </span>
        </div>
        <form onSubmit={onBook} style={{ marginTop: '0.9rem', display: 'grid', gap: '0.55rem' }}>
          <label>
            Check‑in date
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
          </label>
          <label>
            Check‑out date
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </label>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <label style={{ flex: 1 }}>
              Guests
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value) || 1)}
              />
            </label>
            <label style={{ flex: 1 }}>
              Rooms
              <input
                type="number"
                min={1}
                value={rooms}
                onChange={(e) => setRooms(Number(e.target.value) || 1)}
              />
            </label>
          </div>
          <label>
            Special requests
            <textarea
              rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests for your stay…"
            />
          </label>
          {bookingError && <p className="error">{bookingError}</p>}
          <button type="submit" className="btn primary">
            Book Now
          </button>
        </form>

        <div className="booking-summary">
          <div>Price per night: ₹{pricePerNight.toFixed(2)}</div>
          <div>Number of nights: {nights}</div>
          <div>Number of rooms: {rooms}</div>
          <div style={{ marginTop: '0.3rem', fontWeight: 600 }}>
            Total price: ₹{totalPrice.toFixed(2)}
          </div>
        </div>
      </aside>
    </section>
  );
}

