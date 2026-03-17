import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItemComponent from '../components/CartItem';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useStore();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(() => {
    setLoading(true);
    cartAPI.get()
      .then((res) => {
        setCart(res.data);
        refreshCart();
      })
      .catch(() => toast.error('Failed to load cart'))
      .finally(() => setLoading(false));
  }, [refreshCart]);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  const handleClearCart = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    try {
      await cartAPI.clear();
      toast.success('Cart cleared');
      fetchCart();
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '80vh' }}>
        <div className="spinner" />
        <p className="loading-text">Loading cart...</p>
      </div>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className="container page-section">
      <div className="page-header" style={{ paddingTop: 0 }}>
        <div className="page-breadcrumb">
          <Link to="/">Home</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
          <span style={{ color: 'var(--text-primary)' }}>Cart</span>
        </div>
        <h1 className="page-title">Your Cart</h1>
      </div>

      {isEmpty ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3 className="empty-title">Your cart is empty</h3>
          <p className="empty-desc">Add some items to get started.</p>
          <Link to="/" className="btn btn-primary btn-lg">
            <i className="fa-solid fa-bag-shopping" />
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
              </p>
              <button className="btn btn-danger btn-sm" onClick={handleClearCart}>
                <i className="fa-solid fa-trash" /> Clear Cart
              </button>
            </div>

            {cart.items.map((item) => (
              <CartItemComponent key={item.cartItemId} item={item} onUpdate={fetchCart} />
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{Number(cart.totalPrice).toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>
            <div className="summary-row" style={{ paddingTop: 16 }}>
              <span className="summary-total">Total</span>
              <span className="summary-total" style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ₹{Number(cart.totalPrice).toLocaleString('en-IN')}
              </span>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 24 }}
              onClick={() => navigate('/checkout')}
            >
              <i className="fa-solid fa-lock" />
              Proceed to Checkout
            </button>

            <Link to="/" className="btn btn-ghost btn-full" style={{ marginTop: 12 }}>
              <i className="fa-solid fa-arrow-left" />
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
