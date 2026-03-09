import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function BookingPage() {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = Number(searchParams.get('guests')) || 1;
  const rooms = Number(searchParams.get('rooms')) || 1;
  const specialRequests = searchParams.get('specialRequests') || '';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/properties/${propertyId}`);
        setProperty(res.data);
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

  const pricePerNight = Number(property.price) || 0;
  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalPrice = pricePerNight * nights * rooms;

  const onConfirmBooking = async () => {
    setLoading(true);
    setBookingError('');
    setBookingStatus('');
    try {
      const res = await api.post(`/api/properties/${property.propertyId}/book`, {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numGuests: guests,
        numRooms: rooms,
        specialRequests,
      });
      setBookingStatus(res.data?.message || 'Booking created successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create booking. Please log in first.';
      setBookingError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="booking-confirmation">
        <h1 className="page-title">Confirm Your Booking</h1>
        <div className="booking-details">
          <div className="property-summary">
            <img src={property.imageUrl} alt={property.name} className="property-thumb" />
            <div>
              <h2>{property.name}</h2>
              <p className="muted">{property.location} · {property.category}</p>
            </div>
          </div>
          <div className="booking-info">
            <div className="info-row">
              <span>Check-in:</span>
              <span>{new Date(checkIn).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span>Check-out:</span>
              <span>{new Date(checkOut).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span>Guests:</span>
              <span>{guests}</span>
            </div>
            <div className="info-row">
              <span>Rooms:</span>
              <span>{rooms}</span>
            </div>
            <div className="info-row">
              <span>Nights:</span>
              <span>{nights}</span>
            </div>
            {specialRequests && (
              <div className="info-row">
                <span>Special Requests:</span>
                <span>{specialRequests}</span>
              </div>
            )}
          </div>
          <div className="price-breakdown">
            <div className="price-row">
              <span>₹{pricePerNight.toFixed(2)} x {nights} nights x {rooms} rooms</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="total-price">
              <span>Total:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {bookingError && <p className="error">{bookingError}</p>}
        {bookingStatus && <p className="success">{bookingStatus}</p>}
        {!bookingStatus && (
          <div className="booking-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate(`/properties/${propertyId}`)}
            >
              Back to Property
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={onConfirmBooking}
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}