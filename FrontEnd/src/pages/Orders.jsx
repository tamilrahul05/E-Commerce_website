import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  PENDING:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  icon: 'fa-clock' },
  CONFIRMED: { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', icon: 'fa-check' },
  SHIPPED:   { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)',   icon: 'fa-truck' },
  DELIVERED: { color: '#10b981', bg: 'rgba(16,185,129,0.15)',  icon: 'fa-box-open' },
  CANCELLED: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   icon: 'fa-xmark' },
};

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const newOrderId = location.state?.newOrderId;

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(newOrderId || null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    orderAPI.getAll()
      .then((res) => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '80vh' }}>
        <div className="spinner" />
        <p className="loading-text">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container page-section">
      <div style={{ marginBottom: 40 }}>
        <h1 className="page-title">My Orders</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3 className="empty-title">No orders yet</h3>
          <p className="empty-desc">Start shopping to see your orders here.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
            <i className="fa-solid fa-bag-shopping" /> Shop Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
            const isOpen = expanded === order.id;

            return (
              <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
                {/* Order header */}
                <button
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                    padding: '20px 24px', background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: sc.color, fontSize: '1.1rem',
                  }}>
                    <i className={`fa-solid ${sc.icon}`} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-main)', fontWeight: 700 }}>
                        Order #{order.id}
                      </span>
                      <span style={{
                        padding: '2px 10px', borderRadius: '999px',
                        background: sc.bg, color: sc.color,
                        fontSize: '0.72rem', fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        border: `1px solid ${sc.color}40`,
                      }}>
                        {order.status}
                      </span>
                      {order.id === newOrderId && (
                        <span className="badge badge-green">New!</span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      }) : 'N/A'}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: '1.1rem',
                      background: 'var(--gradient-main)', WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <i
                    className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}
                    style={{ color: 'var(--text-muted)', marginLeft: 8 }}
                  />
                </button>

                {/* Expanded details */}
                {isOpen && (
                  <div style={{
                    borderTop: '1px solid var(--border-subtle)',
                    padding: '20px 24px',
                  }}>
                    {order.shippingAddress && (
                      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <i className="fa-solid fa-location-dot" style={{ color: '#a78bfa', marginTop: 3 }} />
                        <div>
                          <p style={{ fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                            Shipping Address
                          </p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                            {order.shippingAddress}
                          </p>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 12px', background: 'rgba(255,255,255,0.03)',
                          borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                style={{
                                  width: 40, height: 40, borderRadius: 'var(--radius-xs)',
                                  objectFit: 'cover', border: '1px solid var(--border-subtle)',
                                }}
                              />
                            )}
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.productName}</p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Qty: {item.quantity} × ₹{Number(item.priceAtPurchase).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <span style={{ fontFamily: 'var(--font-main)', fontWeight: 700 }}>
                            ₹{(item.quantity * item.priceAtPurchase).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
