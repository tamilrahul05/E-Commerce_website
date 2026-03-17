import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCart, toggleWishlist, isInWishlist } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    productAPI.getById(id)
      .then((res) => setProduct(res.data))
      .catch(() => { toast.error('Product not found'); navigate('/'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await cartAPI.addItem(product.id, qty);
      toast.success(`${qty}× ${product.name} added to cart! 🛒`);
      refreshCart();
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '80vh' }}>
        <div className="spinner" />
        <p className="loading-text">Loading product...</p>
      </div>
    );
  }

  if (!product) return null;

  const imgSrc = product.imageUrl?.startsWith('http') ? product.imageUrl : PLACEHOLDER;
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="page-breadcrumb">
            <Link to="/">Home</Link>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
            <span>{product.category || 'Products'}</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
            <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container page-section-sm">
        <div className="product-detail-layout">
          {/* Image */}
          <div className="detail-image-wrap">
            <img
              src={imgSrc}
              alt={product.name}
              className="detail-image"
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <div className="detail-category">
                <i className="fa-solid fa-tag" style={{ marginRight: 6 }} />
                {product.category}
              </div>
            )}

            <h1 className="detail-title">{product.name}</h1>
            <div className="detail-price">₹{Number(product.price).toLocaleString('en-IN')}</div>

            {product.description && (
              <p className="detail-desc">{product.description}</p>
            )}

            <div className="detail-stock">
              {isOutOfStock ? (
                <>
                  <span style={{ color: 'var(--danger)' }}>●</span>
                  <span style={{ color: 'var(--danger)' }}>Out of Stock</span>
                </>
              ) : (
                <>
                  <span style={{ color: 'var(--success)' }}>●</span>
                  <span style={{ color: 'var(--success)' }}>{product.stockQuantity} in stock</span>
                </>
              )}
            </div>

            {!isOutOfStock && (
              <div className="detail-actions">
                {/* Qty selector */}
                <div className="qty-selector">
                  <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span className="qty-val">{qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.min(product.stockQuantity, q + 1))}
                  >+</button>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleAddToCart}
                  disabled={adding}
                >
                  <i className="fa-solid fa-bag-shopping" />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  className={`product-heart-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                  style={{ position: 'relative', top: 'auto', right: 'auto', width: 'auto', padding: '0 20px', borderRadius: 'var(--radius-md)', gap: '8px' }}
                  onClick={() => toggleWishlist(product)}
                  title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <i className={`${isInWishlist(product.id) ? 'fa-solid' : 'fa-regular'} fa-heart`} />
                  <span style={{ fontFamily: 'var(--font-main)', fontWeight: 600 }}>Wishlist</span>
                </button>
              </div>
            )}

            {isAuthenticated && (
              <div style={{ marginTop: 20 }}>
                <Link to="/cart" className="btn btn-outline" style={{ width: '100%' }}>
                  <i className="fa-solid fa-arrow-right" />
                  Go to Cart
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
