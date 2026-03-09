import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, bookingsRes, propsRes, notifRes, requestsRes] = await Promise.all([
          api.get('/api/auth/me'),
          api.get('/api/bookings/my'),
          api.get('/api/properties'),
          api.get('/api/notifications/my'),
          api.get('/api/requests/my'),
        ]);
        setUser(meRes.data);
        setBookings(bookingsRes.data || []);
        setProperties(propsRes.data || []);
        setNotifications(notifRes.data?.items || []);
        setRequests(requestsRes.data || []);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    load();
  } , [navigate]);

  // Handle smooth scrolling and active nav states
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'bookings', 'featured'];
      const scrollPosition = window.scrollY + 200;

      sections.forEach(section => {
        const element = document.getElementById(section);
        const navLink = document.querySelector(`a[href="#${section}"]`);
        
        if (element && navLink) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            navLink.classList.add('active');
          }
        }
      });
    };

    // Handle smooth scrolling for nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <main className="dashboard-main">
          <h1 className="page-title">Dashboard</h1>
          <p>Loading…</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // compute counts
  const categoryCount = [...new Set(properties.map((p) => p.category))].length;
  const propertyCount = properties.length;
  const featured = properties.slice(0, 3);

  return (
    <div className="dashboard-layout">
      {/* Main Content */}
      <main className="dashboard-main">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span> / </span>
          <span>Dashboard</span>
        </div>

        <h1 className="page-title">Dashboard</h1>

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <section className="dashboard-section">
            <h2>📬 Recent Notifications</h2>
            <div className="notifications-list">
              {notifications.slice(0, 5).map((notif) => (
                <div key={notif._id} className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}>
                  <div className="notification-content">
                    <p className="notification-message">{notif.message}</p>
                    <small className="notification-time">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  {notif.link && (
                    <Link to={notif.link} className="notification-link">
                      View →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Overview Section */}
        <section id="overview" className="dashboard-section">
          <h2>Overview</h2>
          {/* Stats Cards */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-icon">🏷️</span>
              <div>
                <div className="stat-value">{categoryCount}</div>
                <div className="stat-label">Categories</div>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏠</span>
              <div>
                <div className="stat-value">{propertyCount}</div>
                <div className="stat-label">Properties</div>
              </div>
            </div>
          </div>
        </section>

        {/* My Bookings Section */}
        <section id="bookings" className="dashboard-section">
          <h2>My Bookings</h2>
          {bookings.length === 0 ? (
            <p className="no-bookings">No bookings yet. <Link to="/properties">Browse properties</Link></p>
          ) : (
            <div className="bookings-table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Guests</th>
                    <th>Total Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>{b.property?.name || b.propertyId}</td>
                      <td>{b.checkInDate?.slice(0, 10)}</td>
                      <td>{b.checkOutDate?.slice(0, 10)}</td>
                      <td>{b.numGuests}</td>
                      <td>₹{b.totalPrice?.toLocaleString()}</td>
                      <td><span className={`status ${b.status?.toLowerCase()}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Featured Properties Section */}
        <section id="featured" className="dashboard-section">
          <div className="featured-header">
            <h2>Featured Properties</h2>
            <Link to="/properties" className="view-all-link">View All</Link>
          </div>
          <div className="featured-grid">
            {featured.map((p) => (
              <Link to={`/properties/${p.propertyId}`} key={p._id} className="featured-card">
                <div className="featured-image">
                  <img src={p.imageUrl || (p.images && p.images[0]) || 'https://via.placeholder.com/300x200'} alt={p.name} />
                </div>
                <div className="featured-info">
                  <h3>{p.name}</h3>
                  <p className="featured-location">{p.location} / {p.category}</p>
                  <p className="featured-price">₹{p.price?.toLocaleString()} / night</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* My Requests Section */}
        <section id="requests" className="dashboard-section">
          <h2>My Requests</h2>
          {requests.length === 0 ? (
            <p className="no-requests">No requests submitted yet. <Link to="/request">Submit a request</Link></p>
          ) : (
            <div className="requests-table-wrapper">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>Admin Reply</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id} className={req.adminNotes ? 'has-reply' : ''}>
                      <td className="request-subject">{req.subject}</td>
                      <td><span className="request-type-badge">{req.requestType}</span></td>
                      <td><span className={`status ${req.status?.toLowerCase()}`}>{req.status}</span></td>
                      <td className="request-message" title={req.message}>
                        {req.message.substring(0, 50)}...
                      </td>
                      <td className="request-reply">
                        {req.adminNotes ? (
                          <div className="reply-box">
                            <p className="reply-text">{req.adminNotes}</p>
                          </div>
                        ) : (
                          <span className="no-reply">Awaiting reply...</span>
                        )}
                      </td>
                      <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

