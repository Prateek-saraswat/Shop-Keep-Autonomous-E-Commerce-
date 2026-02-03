


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    // Auto-refresh every 5 seconds to show new products
    // const interval = setInterval(fetchProducts, 5000);
    // return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8000/api/products');
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Make sure backend is running on port 8000.');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold mb-4 text-red-400">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={fetchProducts} 
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 
              hover:from-blue-500 hover:to-cyan-400 text-white font-bold 
              transition-all duration-300 transform hover:scale-105 hover:shadow-neon-cyan"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-200 
            bg-clip-text text-transparent">
            No Products Yet
          </h2>
          <p className="text-gray-400 mb-6">Use the Admin panel to add products with the  Agent!</p>
          <Link 
            to="/admin" 
            className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 
              hover:from-blue-500 hover:to-cyan-400 text-white font-bold 
              transition-all duration-300 transform hover:scale-105 hover:shadow-neon-cyan"
          >
            Go to Admin Panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-16">
      <div className="mb-16 text-center">
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-blue-400 
          bg-clip-text text-transparent animate-gradient-x">
          All Products
        </h2>
        <p className="text-gray-400 text-lg">
          Discovered and added by Agent {products.length} items
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <Link 
            key={product.id}
            to={`/product/${product.id}`}
            id={`product-${product.id}`}
            className="group relative"
            onMouseEnter={() => setHoveredCard(product.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              animation: `fadeIn 0.6s ease-out ${index * 0.1}s backwards`
            }}
          >
            <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-500 
              hover:-translate-y-2 hover:shadow-glass-lg hover:border-cyan-500/20
              ${hoveredCard === product.id ? 'shadow-neon-cyan' : ''}`}>
              
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                transition-opacity duration-500 pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(34, 211, 238, 0.2))',
                  padding: '1px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              <div className="relative  aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                <img 
                  src={`http://localhost:8000/static${product.image_path}`}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-700 
                    group-hover:scale-110 group-hover:brightness-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {product.stock < 5 && product.stock > 0 && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full backdrop-blur-md 
                    bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-medium">
                    Only {product.stock} left!
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full backdrop-blur-md 
                    bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-medium">
                    Out of Stock
                  </div>
                )}

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.1), transparent 70%)'
                  }}
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 
                  transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {product.description && product.description.length > 100 
                    ? product.description.substring(0, 100) + '...' 
                    : product.description || 'High quality product'}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 
                    bg-clip-text text-transparent">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm group-hover:text-cyan-400 
                    transition-colors duration-300">
                    <span>View Details</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 
                bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-gradient-x 
                transition-opacity duration-500" />
            </div>

            <div className={`absolute inset-0 -z-10 rounded-2xl blur-2xl transition-opacity duration-500 
              ${hoveredCard === product.id ? 'opacity-60' : 'opacity-0'}`}
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.3), transparent 70%)'
              }}
            />
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductGrid;