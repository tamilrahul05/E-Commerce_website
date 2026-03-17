import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [placing, setPlacing]     = useState(false);
  const [address, setAddress]     = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    cartAPI.get()
      .then((res) => {
        setCart(res.data);
        if (!res.data?.items?.length) {
          toast.error('Your cart is empty');
          navigate('/cart');
        }
      })
      .catch(() => navigate('/cart'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Please enter a shipping address');
      return;
    }
    setPlacing(true);
    try {
      const res = await orderAPI.place(address);
      toast.success('Order placed successfully! 🎉');
      navigate('/orders', { state: { newOrderId: res.data.id } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '80vh' }}>
        <div className="spinner" />
        <p className="loading-text">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="container page-section">
      <div style={{ marginBottom: 40 }}>
        <div className="page-breadcrumb">
          <Link to="/">Home</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
          <Link to="/cart">Cart</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
          <span style={{ color: 'var(--text-primary)' }}>Checkout</span>
        </div>
        <h1 className="page-title">Checkout</h1>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="checkout-layout">
          {/* Left column */}
          <div>
            {/* Customer info */}
            <div className="checkout-section">
              <h3>
                <i className="fa-solid fa-user" style={{ marginRight: 10, color: '#a78bfa' }} />
                Customer Information
              </h3>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={user?.username || ''}
                  readOnly
                  style={{ opacity: 0.7 }}
                />
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  readOnly
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>

            {/* Shipping address */}
            <div className="checkout-section">
              <h3>
                <i className="fa-solid fa-location-dot" style={{ marginRight: 10, color: '#a78bfa' }} />
                Shipping Address
              </h3>
              <div className="form-group">
                <label className="form-label">Full Address</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Enter your full shipping address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Payment placeholder */}
            <div className="checkout-section">
              <h3>
                <i className="fa-solid fa-credit-card" style={{ marginRight: 10, color: '#a78bfa' }} />
                Payment Method
              </h3>
              <div style={{
                padding: '20px',
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <i className="fa-solid fa-money-bill-wave" style={{ color: '#a78bfa', fontSize: '1.2rem' }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-main)', fontWeight: 700, marginBottom: 2 }}>
                    Cash on Delivery
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Pay when your order arrives
                  </p>
                </div>
                <i className="fa-solid fa-check-circle" style={{ color: 'var(--success)', marginLeft: 'auto', fontSize: '1.2rem' }} />
              </div>
            </div>
          </div>

          {/* Right — Order summary */}
          <div>
            <div className="cart-summary">
              <h3>Order Summary</h3>

              {/* Items */}
              <div className="checkout-items">
                {cart?.items.map((item) => (
                  <div key={item.cartItemId} className="checkout-item">
                    <img
                      src={item.imageUrl?.startsWith('http')
                        ? item.imageUrl
                        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                      alt={item.productName}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'; }}
                    />
                    <div className="checkout-item-info">
                      <p className="checkout-item-name">{item.productName}</p>
                      <p className="checkout-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="checkout-item-price">
                      ₹{Number(item.subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-row" style={{ marginTop: 16 }}>
                <span>Subtotal</span>
                <span>₹{Number(cart?.totalPrice || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: 'var(--success)' }}>Free</span>
              </div>
              <div className="summary-row">
                <span className="summary-total">Total</span>
                <span className="summary-total" style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  ₹{Number(cart?.totalPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: 24 }}
                disabled={placing}
              >
                {placing ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }} /> Placing Order...</>
                ) : (
                  <><i className="fa-solid fa-check" /> Place Order</>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
