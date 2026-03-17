import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { cartAPI } from '../services/api';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isSubAdmin } = useAuth();
  const { cartCount, wishlist } = useStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const themes = ['dark', 'light', 'cyber', 'sunset', 'forest', 'aurora'];
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // PERSISTENCE handled by document.documentElement already in useEffect above

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          Tamil_E_Commerce
        </Link>

        {/* Theme Toggle & Links Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle Button */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={toggleTheme}
            title={`Current theme: ${theme}`}
            style={{ fontSize: '1.1rem', padding: '8px' }}
          >
            {theme === 'dark' && <i className="fa-solid fa-moon" />}
            {theme === 'light' && <i className="fa-solid fa-sun" />}
            {theme === 'cyber' && <i className="fa-solid fa-bolt" style={{ color: 'var(--accent-cyan)' }} />}
            {theme === 'sunset' && <i className="fa-solid fa-mountain-sun" style={{ color: 'var(--accent-purple)' }} />}
            {theme === 'forest' && <i className="fa-solid fa-tree" style={{ color: '#10b981' }} />}
            {theme === 'aurora' && <i className="fa-solid fa-bridge-water" style={{ color: '#38bdf8' }} />}
          </button>

          {/* Mobile Menu Toggle (Right Side) */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`fa-solid fa-${mobileMenuOpen ? 'xmark' : 'bars'}`} />
          </button>

          {/* Desktop Links / Mobile Menu */}
          <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end onClick={() => setMobileMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              Shop
            </NavLink>
            {(isAdmin || isSubAdmin) && (
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Admin
              </NavLink>
            )}

            {isAuthenticated ? (
              <>
                {/* Wishlist Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="nav-link nav-wishlist-btn"
                    onClick={() => { setWishlistOpen(!wishlistOpen); setMenuOpen(false); }}
                    title="Wishlist"
                  >
                    <i className="fa-solid fa-heart" style={{ color: wishlist.length > 0 ? 'var(--accent-pink)' : 'inherit' }} />
                    Wishlist
                    {wishlist.length > 0 && (
                      <span className="cart-badge">{wishlist.length}</span>
                    )}
                  </button>

                  {wishlistOpen && (
                    <div className="wishlist-dropdown">
                      <div className="wishlist-header">
                        <span>Your Wishlist</span>
                        <span className="badge badge-purple">{wishlist.length} items</span>
                      </div>
                      <div className="wishlist-items">
                        {wishlist.length === 0 ? (
                          <div className="wishlist-empty">Your wishlist is empty</div>
                        ) : (
                          wishlist.map((item) => (
                            <div
                              key={item.id}
                              className="wishlist-item"
                              onClick={() => {
                                if (item.id !== undefined && item.id !== null) {
                                  navigate(`/products/${item.id}`);
                                  setWishlistOpen(false);
                                }
                              }}
                            >
                              <img
                                src={item.imageUrl?.startsWith('http') ? item.imageUrl : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                                alt={item.name}
                                className="wishlist-img"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'; }}
                              />
                              <div className="wishlist-info">
                                <div className="wishlist-name">{item.name}</div>
                                <div className="wishlist-price">₹{Number(item.price).toLocaleString('en-IN')}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {wishlist.length > 0 && (
                        <div className="wishlist-footer">
                          <button className="btn btn-primary btn-sm btn-full" onClick={() => { navigate('/cart'); setWishlistOpen(false); }}>
                            View Cart
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cart */}
                <Link to="/cart" className="nav-cart-btn" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-bag-shopping" />
                  Cart
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>

                {/* User Menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="navbar-user btn btn-ghost btn-sm"
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{ gap: 10 }}
                  >
                    <div className="user-avatar">{initials}</div>
                    <span style={{ fontFamily: 'var(--font-main)', fontWeight: 600 }}>
                      {user.username}
                    </span>
                    <i className={`fa-solid fa-chevron-${menuOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7rem' }} />
                  </button>

                  {menuOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)', padding: '8px',
                      minWidth: 160, boxShadow: 'var(--shadow-md)', zIndex: 50,
                    }}>
                      <Link
                        to="/orders"
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}
                        onClick={() => setMenuOpen(false)}
                      >
                        <i className="fa-solid fa-box" /> My Orders
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', gap: 10, marginTop: 4 }}
                        onClick={handleLogout}
                      >
                        <i className="fa-solid fa-right-from-bracket" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlays to close menus */}
      {(menuOpen || wishlistOpen || mobileMenuOpen) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => { setMenuOpen(false); setWishlistOpen(false); setMobileMenuOpen(false); }}
        />
      )}
    </nav>
  );
};

export default Navbar;
