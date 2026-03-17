import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../services/api';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const fetchProducts = () => {
    setLoading(true);
    productAPI.getAll()
      .then((res) => {
        setProducts(res.data);
        setFiltered(res.data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  // Client-side filter
  useEffect(() => {
    let data = [...products];
    if (category !== 'All') {
      data = data.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (search.trim()) {
      data = data.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(data);
  }, [search, category, products]);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="container">
          <div className="hero-content">

            <h1 className="hero-title">
              Shop the{' '}
              <span className="gradient-text">Future</span>
              <br />of Commerce
            </h1>

            <p className="hero-subtitle">
              Discover curated premium products, from cutting-edge electronics to exclusive fashion.
              Your one-stop destination for everything modern.
            </p>

            <div className="hero-cta">
              <a
                href="#shop"
                className="btn btn-primary btn-lg"
                onClick={(e) => { e.preventDefault(); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <i className="fa-solid fa-bag-shopping" />
                Shop Now
              </a>
              <Link to="/register" className="btn btn-outline btn-lg">
                <i className="fa-solid fa-user-plus" />
                Join Free
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Products</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">1K+</div>
                <div className="stat-label">Customers</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9★</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOP SECTION ─────────────────────────────────────── */}
      <section id="shop" className="page-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">
              <i className="fa-solid fa-sparkles" />
              Featured Products
            </div>
            <h2 className="section-title">
              Discover Our <span className="gradient-text">Collection</span>
            </h2>
            <p className="section-desc">
              Hand-picked premium items from the best brands, delivered to your door.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="search-wrap">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                className="search-input"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="category-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`pill ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <p className="loading-text">Loading products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3 className="empty-title">No products found</h3>
              <p className="empty-desc">Try adjusting your search or category filter.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory('All'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                  <ProductCard product={product} onCartUpdate={fetchProducts} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-brand">Tamil_E_Commerce</span>
          <p className="footer-copy">© 2026 Tamil_E_Commerce. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
