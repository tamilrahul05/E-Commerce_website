import React from 'react';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';

const CartItemComponent = ({ item, onUpdate }) => {
  const { cartItemId, productName, imageUrl, price, quantity, subtotal } = item;

  const imgSrc = imageUrl?.startsWith('http') ? imageUrl : PLACEHOLDER;

  const handleQty = async (newQty) => {
    if (newQty < 1) return handleRemove();
    try {
      await cartAPI.updateItem(cartItemId, newQty);
      if (onUpdate) onUpdate();
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async () => {
    try {
      await cartAPI.removeItem(cartItemId);
      toast.success('Item removed from cart');
      if (onUpdate) onUpdate();
    } catch {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="cart-item-card">
      {/* Product image */}
      <img
        src={imgSrc}
        alt={productName}
        className="cart-item-img"
        onError={(e) => { e.target.src = PLACEHOLDER; }}
      />

      {/* Details */}
      <div className="cart-item-details">
        <p className="cart-item-name">{productName}</p>
        <p className="cart-item-price">
          ₹{Number(price).toLocaleString('en-IN')} each
        </p>
      </div>

      {/* Quantity control */}
      <div className="qty-control">
        <button className="qty-btn" onClick={() => handleQty(quantity - 1)}>−</button>
        <span className="qty-value">{quantity}</span>
        <button className="qty-btn" onClick={() => handleQty(quantity + 1)}>+</button>
      </div>

      {/* Subtotal */}
      <div className="cart-item-subtotal">
        ₹{Number(subtotal).toLocaleString('en-IN')}
      </div>

      {/* Remove */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={handleRemove}
        title="Remove item"
        style={{ color: 'var(--danger)' }}
      >
        <i className="fa-solid fa-trash" />
      </button>
    </div>
  );
};

export default CartItemComponent;
