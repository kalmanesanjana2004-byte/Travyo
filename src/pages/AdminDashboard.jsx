import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  // new property modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [newProp, setNewProp] = useState({
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

  // reply modal state
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');


  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // convert to data URLs
    Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    ).then((dataUrls) => {
      setNewProp((old) => ({ ...old, images: dataUrls }));
    });
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newProp.name,
        location: newProp.location,
        category: newProp.category,
        price: Number(newProp.price),
        rating: Number(newProp.rating),
        description: newProp.description,
        features: newProp.features,
        images: newProp.images.length > 0 ? newProp.images : newProp.imageUrl ? [newProp.imageUrl] : [],
      };

      let response;
      if (isEditMode) {
        // Update existing property
        response = await api.put(`/api/properties/${editingPropertyId}`, payload);
        alert('Property updated successfully!');
      } else {
        // Create new property
        response = await api.post('/api/properties', payload);
        alert('Property added successfully!');
      }

      setShowAddModal(false);
      // refresh overview or properties list
      const res = await api.get('/api/admin/overview');
      setOverview(res.data);
      if (res.data.activeProperties) {
        setAllProperties(res.data.activeProperties);
      }

      // Reset form
      setNewProp({
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
      setIsEditMode(false);
      setEditingPropertyId(null);
    } catch (err) {
      console.error('Property operation failed', err);
      alert(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} property`);
    }
  };

  const handleApproveProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to approve this property?')) return;
    try {
      await api.post(`/api/properties/${propertyId}/approve`);
      // Refresh the overview data
      const res = await api.get('/api/admin/overview');
      setOverview(res.data);
      alert('Property approved successfully!');
    } catch (err) {
      console.error('Approve property failed', err);
      alert(err.response?.data?.message || 'Failed to approve property');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/properties/${propertyId}`);
      // Refresh the overview data
      const res = await api.get('/api/admin/overview');
      setOverview(res.data);
      alert('Property deleted successfully!');
    } catch (err) {
      console.error('Delete property failed', err);
      alert(err.response?.data?.message || 'Failed to delete property');
    }
  };

  const handleViewProperty = (property) => {
    // Navigate to property detail page
    window.open(`/properties/${property.propertyId}`, '_blank');
  };

  const handleEditProperty = (property) => {
    setNewProp({
      name: property.name || '',
      location: property.location || '',
      category: property.category || '',
      price: property.price || '',
      rating: property.rating || '',
      imageUrl: property.imageUrl || '',
      images: property.images || [],
      description: property.description || '',
      features: property.features || '',
    });
    setIsEditMode(true);
    setEditingPropertyId(property.propertyId);
    setShowAddModal(true);
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to confirm this booking?')) return;
    try {
      await api.post(`/api/bookings/${bookingId}/confirm`);
      // Refresh the overview data
      const res = await api.get('/api/admin/overview');
      setOverview(res.data);
      alert('Booking confirmed successfully!');
    } catch (err) {
      console.error('Confirm booking failed', err);
      alert(err.response?.data?.message || 'Failed to confirm booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to reject this booking?')) return;
    try {
      await api.post(`/api/bookings/${bookingId}/reject`);
      // Refresh the overview data
      const res = await api.get('/api/admin/overview');
      setOverview(res.data);
      alert('Booking rejected successfully!');
    } catch (err) {
      console.error('Reject booking failed', err);
      alert(err.response?.data?.message || 'Failed to reject booking');
    }
  };

  const handleReplyToRequest = (request) => {
    setReplyingTo(request);
    setReplyText('');
    setShowReplyModal(true);
  };

  const handleReviewRequest = (request) => {
    // Navigate to a detailed view or open a modal for reviewing
    alert(`Reviewing request from ${request.name}: ${request.subject}`);
  };

  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    try {
      await api.put(`/api/requests/${requestId}`, { status: newStatus });
      // Refresh the overview data
      const res = await api.get('/api/admin/overview');
      setOverview(res.data);
      alert('Request status updated successfully!');
    } catch (err) {
      console.error('Update request status failed', err);
      alert(err.response?.data?.message || 'Failed to update request status');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/requests/${requestId}`);
      // Refresh the overview data
      const res = await api.get('/api/admin/overview');
      setOverview(res.data);
      alert('Request deleted successfully!');
    } catch (err) {
      console.error('Delete request failed', err);
      alert(err.response?.data?.message || 'Failed to delete request');
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyingTo || !replyText.trim()) return;

    try {
      await api.post(`/api/requests/${replyingTo._id}/reply`, { reply: replyText });
      // Refresh the overview data
      const res = await api.get('/api/admin/overview');
      setOverview(res.data);
      alert('Reply sent successfully!');
      setShowReplyModal(false);
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error('Send reply failed', err);
      alert(err.response?.data?.message || 'Failed to send reply');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.get('/api/auth/me');
        if (!me.data.isAdmin) {
          navigate('/');
          return;
        }
        const res = await api.get('/api/admin/overview');
        setOverview(res.data);
        // if activeProperties included, store separately
        if (res.data.activeProperties) {
          setAllProperties(res.data.activeProperties);
        }
      } catch {
        navigate('/admin-login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      navigate('/admin-login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-sidebar">
          <div className="admin-logo">TravYo Admin</div>
        </div>
        <div className="admin-main">
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span style={{ fontSize: '18px' }}>🏨</span> TravYo Admin
        </div>
        <nav className="admin-nav">
          <div className="nav-section">
            <p className="nav-label">MAIN</p>
            <a 
              href="#dashboard" 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span>📊</span> Dashboard
            </a>
            <a 
              href="#properties" 
              className={`nav-item ${activeTab === 'properties' ? 'active' : ''}`}
              onClick={() => setActiveTab('properties')}
            >
              <span>🏠</span> Property
            </a>
            <a 
              href="#bookings" 
              className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span>📅</span> Bookings
            </a>
            <a 
              href="#requests" 
              className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <span>💬</span> Requests
            </a>
            <a 
              href="#users" 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span>👥</span> Manage Users
            </a>
            <a 
              href="#pending" 
              className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <span>⏳</span> Pending Properties
            </a>
          </div>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="search-box">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="admin-toolbar">
            <button className="icon-btn">🔔</button>
            <div className="user-menu">
              <div className="user-avatar">AD</div>
              <span className="user-name">Admin User</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </header>

        <section className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <h1>Dashboard</h1>
              <div className="breadcrumb">
                <a href="#home">Home</a> / <span>Dashboard</span>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div>
                    <div className="stat-value">{overview.totalUsers}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏠</div>
                  <div>
                    <div className="stat-value">{overview.totalProperties}</div>
                    <div className="stat-label">Total Properties</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div>
                    <div className="stat-value">{overview.totalBookings}</div>
                    <div className="stat-label">Total Bookings</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div>
                    <div className="stat-value">{overview.pendingProperties?.length || 0}</div>
                    <div className="stat-label">Pending Properties</div>
                  </div>
                </div>
              </div>

              <div className="charts-section">
                <div className="chart-container">
                  <h3>Revenue Overview</h3>
                  <div className="chart-placeholder">📈 Chart loaded successfully</div>
                </div>
                <div className="chart-container">
                  <h3>User Acquisition</h3>
                  <div className="chart-placeholder">📈 Chart loaded successfully</div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {overview.bookings?.slice(0, 5).map((booking, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-icon">📍</div>
                      <div className="activity-text">
                        <p>Booking #{booking.bookingId}</p>
                        <small>{new Date(booking.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="properties-view">
              {showAddModal && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h2>{isEditMode ? 'Edit Property' : 'Add New Property'}</h2>
                    <form className="property-form" onSubmit={handleAddProperty}>
                      <label>
                        Property Name *
                        <input
                          type="text"
                          value={newProp.name}
                          onChange={(e) => setNewProp({ ...newProp, name: e.target.value })}
                          required
                        />
                      </label>
                      <label>
                        Location *
                        <input
                          type="text"
                          value={newProp.location}
                          onChange={(e) => setNewProp({ ...newProp, location: e.target.value })}
                          placeholder="Click to select location on map"
                          required
                        />
                      </label>
                      <button type="button" className="map-btn" onClick={() => alert('Map selector not implemented')}>Select on Map</button>

                      <label>
                        Category *
                        <select
                          value={newProp.category}
                          onChange={(e) => setNewProp({ ...newProp, category: e.target.value })}
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
                          value={newProp.price}
                          onChange={(e) => setNewProp({ ...newProp, price: e.target.value })}
                          required
                        />
                      </label>
                      <label>
                        Rating *
                        <input
                          type="number"
                          step="0.1"
                          value={newProp.rating}
                          onChange={(e) => setNewProp({ ...newProp, rating: e.target.value })}
                          required
                        />
                      </label>

                      <label>
                        Upload Photos (4-5 photos) *
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="help-text">You can upload up to 5 photos. Supported formats: JPG, PNG, GIF, WEBP</p>
                      <label>
                        Or Image URL (Alternative)
                        <input
                          type="url"
                          value={newProp.imageUrl}
                          onChange={(e) => setNewProp({ ...newProp, imageUrl: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                        <p className="help-text">If you don't upload files, you can provide an image URL instead</p>
                      </label>

                      <label>
                        Description *
                        <textarea
                          value={newProp.description}
                          onChange={(e) => setNewProp({ ...newProp, description: e.target.value })}
                          required
                        />
                      </label>
                      <label>
                        Features (comma-separated) *
                        <input
                          type="text"
                          value={newProp.features}
                          onChange={(e) => setNewProp({ ...newProp, features: e.target.value })}
                          placeholder="e.g., Pool, Spa, Beach Access"
                          required
                        />
                        <p className="help-text">Separate multiple features with commas</p>
                      </label>

                      <div className="modal-actions">
                        <button type="button" className="btn cancel" onClick={() => {
                          setShowAddModal(false);
                          setIsEditMode(false);
                          setEditingPropertyId(null);
                          setNewProp({
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
                        }}>✕ Cancel</button>
                        <button type="submit" className="btn save">{isEditMode ? 'Update Property' : 'Save Property'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              <h1>Property Management</h1>
              <div className="breadcrumb">
                <a href="#home">Home</a> / <span>Property</span>
              </div>
              <button className="btn-add" onClick={() => {
                setIsEditMode(false);
                setEditingPropertyId(null);
                setNewProp({
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
                setShowAddModal(true);
              }}>+ Add New Property</button>

              {allProperties.length > 0 && (
                <div className="properties-table">
                  <h3>Active Properties</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Property Name</th>
                        <th>Location</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProperties.map((prop) => (
                        <tr key={prop._id || prop.propertyId}>
                          <td>{prop.name}</td>
                          <td>{prop.location}</td>
                          <td>{prop.category}</td>
                          <td>${prop.price?.toFixed(2)}</td>
                          <td>{prop.rating}⭐</td>
                          <td><span className="status active">Active</span></td>
                          <td>
                            <button 
                              className="action-btn view" 
                              onClick={() => handleViewProperty(prop)}
                            >
                              👁 View
                            </button>
                            <button 
                              className="action-btn edit" 
                              onClick={() => handleEditProperty(prop)}
                            >
                              ✏ Edit
                            </button>
                            <button 
                              className="action-btn delete" 
                              onClick={() => handleDeleteProperty(prop.propertyId)}
                            >
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="properties-table">
                <h3>Pending Properties</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Property Name</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.pendingProperties?.map((prop, idx) => (
                      <tr key={idx}>
                        <td>{prop.name}</td>
                        <td>{prop.location}</td>
                        <td>{prop.category}</td>
                        <td>${prop.price?.toFixed(2)}</td>
                        <td>{prop.rating}⭐</td>
                        <td><span className={`status ${prop.isActive ? 'active' : 'inactive'}`}>{prop.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td><a href="#view">View</a> | <a href="#edit">Edit</a> | <a href="#delete">Delete</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-view">
              <h1>Bookings</h1>
              <div className="breadcrumb">
                <a href="#home">Home</a> / <span>Bookings</span>
              </div>
              <div className="bookings-table">
                <h3>User Bookings</h3>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Property</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Guests</th>
                      <th>Rooms</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.bookings?.map((booking, idx) => (
                      <tr key={idx}>
                        <td>{booking.bookingId}</td>
                        <td>{overview.recentUsers?.find(u => u._id === booking.userId)?.name || 'N/A'}</td>
                        <td>{booking.propertyId}</td>
                        <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                        <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                        <td>{booking.numGuests}</td>
                        <td>{booking.numRooms}</td>
                        <td>${booking.totalPrice?.toFixed(2)}</td>
                        <td><span className={`status ${booking.status}`}>{booking.status}</span></td>
                        <td><button 
                              className="action-btn approve" 
                              onClick={() => handleConfirmBooking(booking.bookingId)}
                            >
                              Accept
                            </button>
                            <button 
                              className="action-btn delete" 
                              onClick={() => handleRejectBooking(booking.bookingId)}
                            >
                              Reject
                            </button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-view">
              <h1>Requests</h1>
              <div className="breadcrumb">
                <a href="#home">Home</a> / <span>Requests</span>
              </div>
              
              <div className="requests-table">
                <div className="table-header">
                  <h3>User Requests</h3>
                  <span className="total-count">{overview.requests?.length || 0} total</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Admin Reply</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.requests?.map((req, idx) => (
                      <tr key={idx}>
                        <td>{overview.requests.length - idx}</td>
                        <td>{req.name}</td>
                        <td>{req.email}</td>
                        <td>{req.requestType}</td>
                        <td>{req.subject}</td>
                        <td>{req.message}</td>
                        <td><span className={`status ${req.status}`}>{req.status}</span></td>
                        <td>{req.adminNotes || '-'}</td>
                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="action-btn view" 
                            onClick={() => handleReplyToRequest(req)}
                          >
                            Reply
                          </button>
                          <button 
                            className="action-btn edit" 
                            onClick={() => handleReviewRequest(req)}
                          >
                            Review
                          </button>
                          <select 
                            className="status-select" 
                            value={req.status} 
                            onChange={(e) => handleUpdateRequestStatus(req._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                          <button 
                            className="action-btn delete" 
                            onClick={() => handleDeleteRequest(req._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Reply Modal */}
              {showReplyModal && replyingTo && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h2>Reply to Request</h2>
                    <div style={{ marginBottom: '20px' }}>
                      <h3>Request Details:</h3>
                      <p><strong>From:</strong> {replyingTo.name} ({replyingTo.email})</p>
                      <p><strong>Subject:</strong> {replyingTo.subject}</p>
                      <p><strong>Message:</strong> {replyingTo.message}</p>
                      {replyingTo.adminNotes && (
                        <p><strong>Previous Reply:</strong> {replyingTo.adminNotes}</p>
                      )}
                    </div>
                    <form onSubmit={handleSubmitReply}>
                      <label>
                        Your Reply *
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          required
                          rows={6}
                          placeholder="Enter your reply to this request..."
                        />
                      </label>
                      <div className="modal-actions">
                        <button type="button" className="btn cancel" onClick={() => {
                          setShowReplyModal(false);
                          setReplyingTo(null);
                          setReplyText('');
                        }}>✕ Cancel</button>
                        <button type="submit" className="btn save">Send Reply</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-view">
              <h1>Manage Users</h1>
              <div className="breadcrumb">
                <a href="#home">Home</a> / <span>Manage Users</span>
              </div>
              <div className="users-table">
                <div className="table-header">
                  <h3>All Users</h3>
                  <span className="total-count">{overview.recentUsers?.length || 0} users</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recentUsers?.map((user, idx) => (
                      <tr key={idx}>
                        <td>{overview.recentUsers.length - idx}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td><span className="status active">Active</span></td>
                        <td>
                          <a href="#edit" className="action-link">Edit</a>
                          <a href="#delete" className="action-link delete">Delete</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="pending-view">
              <h1>Pending Properties</h1>
              <div className="breadcrumb">
                <a href="#home">Home</a> / <span>Pending Properties</span>
              </div>
              <div className="success-message">✅ Admin login successful!</div>
              
              <div className="pending-properties-table">
                <div className="table-header">
                  <h3>User-Submitted Properties</h3>
                  <span className="total-count">{overview.pendingProperties?.length || 0} pending</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Property Name</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Submitted By</th>
                      <th>Submitted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.pendingProperties?.map((prop, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="property-cell">
                            {prop.imageUrl ? (
                              <img src={prop.imageUrl} alt={prop.name} className="property-thumb" />
                            ) : (
                              <div className="property-thumb-placeholder">📷</div>
                            )}
                            <div>
                              <strong>{prop.name}</strong>
                              <small>{prop.description?.substring(0, 30)}...</small>
                            </div>
                          </div>
                        </td>
                        <td>{prop.location}</td>
                        <td>{prop.category}</td>
                        <td>${prop.price?.toFixed(2)}</td>
                        <td>{prop.createdBy?.name || 'Unknown'}</td>
                        <td>{new Date(prop.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="action-btn approve" 
                            onClick={() => handleApproveProperty(prop.propertyId)}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            className="action-btn delete" 
                            onClick={() => handleDeleteProperty(prop.propertyId)}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

