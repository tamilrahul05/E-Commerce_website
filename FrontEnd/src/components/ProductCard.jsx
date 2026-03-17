import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

const ProductCard = ({ product, onCartUpdate }) => {
  const { isAuthenticated } = useAuth();
  const { refreshCart, toggleWishlist, isInWishlist } = useStore();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    try {
      await cartAPI.addItem(product.id, 1);
      toast.success(`${product.name} added to cart! 🛒`);
      refreshCart();
    } catch {
      toast.error('Failed to add item to cart');
    }
  };

  const isOutOfStock = product.stockQuantity <= 0;
  const imgSrc = product.imageUrl?.startsWith('http')
    ? product.imageUrl
    : PLACEHOLDER;

  return (
    <div className="product-card">
      {/* Image */}
      <div className="product-image-wrap">
        <img
          src={imgSrc}
          alt={product.name}
          className="product-image"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />

        {/* Heart Wishlist Toggle */}
        <button
          className={`product-heart-btn ${isInWishlist(product.id) ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i className={`${isInWishlist(product.id) ? 'fa-solid' : 'fa-regular'} fa-heart`} />
        </button>

        {/* Category tag */}
        {product.category && (
          <span className="product-category-tag">{product.category}</span>
        )}

        {/* Stock indicator */}
        <span
          className={`product-stock-tag badge ${isOutOfStock ? 'badge-red' : 'badge-green'}`}
        >
          {isOutOfStock ? 'Out of Stock' : `${product.stockQuantity} left`}
        </span>

        {/* Hover overlay with quick-add */}
        <div className="product-overlay">
          {!isOutOfStock && (
            <button className="product-quick-add" onClick={handleAddToCart}>
              <i className="fa-solid fa-bag-shopping" style={{ marginRight: 6 }} />
              Quick Add
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}

        <div className="product-footer">
          <span className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</span>

          <button
            className="product-add-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title="Add to cart"
          >
            <i className="fa-solid fa-plus" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
