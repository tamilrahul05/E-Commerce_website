import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EMPTY_PRODUCT = {
  name: '', description: '', price: '', stockQuantity: '',
  category: '', imageUrl: '',
};

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, isSubAdmin } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);  // product being edited
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [imageSource, setImageSource] = useState('url'); // 'url' or 'local'
  const [localFile, setLocalFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || (!isAdmin && !isSubAdmin)) { navigate('/'); return; }
  }, [isAuthenticated, isAdmin, isSubAdmin, navigate]);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([productAPI.getAll(), orderAPI.getAll()])
      .then(([p, o]) => { setProducts(p.data); setOrders(o.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (isAuthenticated && (isAdmin || isSubAdmin)) fetchData(); }, [isAuthenticated, isAdmin, isSubAdmin, fetchData]);

  const openModal = (product = null) => {
    setEditing(product);
    setForm(product ? { ...product } : EMPTY_PRODUCT);
    setImageSource('url');
    setLocalFile(null);
    setImagePreview(product?.imageUrl || null);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImageUrl = form.imageUrl;

      // Handle file upload if local source is selected
      if (imageSource === 'local' && localFile) {
        const uploadRes = await productAPI.upload(localFile);
        finalImageUrl = uploadRes.data.url;
      }

      const payload = {
        ...form,
        imageUrl: finalImageUrl,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity)
      };

      if (editing) {
        await productAPI.update(editing.id, payload);
        toast.success('Product updated');
      } else {
        await productAPI.create(payload);
        toast.success('Product created');
      }
      setModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await productAPI.delete(id);
      toast.success(`"${name}" deleted`);
      fetchData();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast.success(`Order #${orderId} → ${status}`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const totalRevenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '80vh' }}>
        <div className="spinner" />
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container page-section">
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Manage your store products and orders
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">📦</div>
          <div className="stat-card-label">Total Products</div>
          <div className="stat-card-value">{products.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🛒</div>
          <div className="stat-card-label">Total Orders</div>
          <div className="stat-card-value">{orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-label">Revenue</div>
          <div className="stat-card-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🟡</div>
          <div className="stat-card-label">Pending Orders</div>
          <div className="stat-card-value">{orders.filter((o) => o.status === 'PENDING').length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          <i className="fa-solid fa-boxes-stacked" style={{ marginRight: 8 }} />
          Products
        </button>
        <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          <i className="fa-solid fa-receipt" style={{ marginRight: 8 }} />
          Orders
        </button>
      </div>

      {/* ── PRODUCTS TAB ── */}
      {tab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button className="btn btn-primary" onClick={() => openModal()}>
              <i className="fa-solid fa-plus" /> Add Product
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={p.imageUrl?.startsWith('http') ? p.imageUrl : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=80'}
                        alt={p.name}
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: 'var(--bg-secondary)', flexShrink: 0 }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=80'; }}
                      />
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </td>
                    <td>
                      <span className="badge badge-purple">{p.category || '—'}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-main)', fontWeight: 700 }}>
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${p.stockQuantity > 0 ? 'badge-green' : 'badge-red'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openModal(p)}>
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                      No products yet. Click "Add Product" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {tab === 'orders' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'var(--font-main)', fontWeight: 700 }}>#{o.id}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>User #{o.userId || '—'}</td>
                  <td>{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                  <td style={{ fontFamily: 'var(--font-main)', fontWeight: 700 }}>
                    ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 8,
                        padding: '6px 10px',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        fontFamily: 'var(--font-main)',
                        cursor: 'pointer',
                      }}
                    >
                      {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PRODUCT MODAL ── */}
      {modal && (
        <div className="admin-product-modal">
          <div className="modal-backdrop" onClick={() => setModal(false)} />
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input className="form-input" placeholder="e.g. iPhone 15 Pro" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} placeholder="Product description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ resize: 'vertical' }} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" min="0" step="0.01" className="form-input" placeholder="999.00"
                    value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Qty</label>
                  <input type="number" min="0" className="form-input" placeholder="100"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" placeholder="Electronics, Clothing, Books..." value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${imageSource === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setImageSource('url')}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${imageSource === 'local' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setImageSource('local')}
                  >
                    Upload Local
                  </button>
                </div>

                {imageSource === 'url' ? (
                  <input type="url" className="form-input" placeholder="https://example.com/image.jpg"
                    value={form.imageUrl} onChange={(e) => {
                      setForm({ ...form, imageUrl: e.target.value });
                      setImagePreview(e.target.value);
                    }} />
                ) : (
                  <div className="file-upload-wrap">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setLocalFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <label htmlFor="file-upload" className="btn btn-outline btn-full" style={{ cursor: 'pointer' }}>
                      <i className="fa-solid fa-cloud-arrow-up"></i> {localFile ? localFile.name : 'Choose Image'}
                    </label>
                  </div>
                )}

                {imagePreview && (
                  <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-subtle)', height: 120 }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&q=80'; }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
