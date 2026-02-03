import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/products/${id}`);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      setError('Product not found');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };




  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="glass-card rounded-3xl p-8 animate-pulse">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-800/50 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-800/50 rounded"></div>
              <div className="h-6 bg-gray-800/50 rounded w-3/4"></div>
              <div className="h-32 bg-gray-800/50 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-3xl font-bold mb-4 text-red-400">Product Not Found</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link 
            to="/" 
            className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 
              hover:from-blue-500 hover:to-cyan-400 text-white font-bold 
              transition-all duration-300 transform hover:scale-105 hover:shadow-neon-cyan"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 animate-scaleIn">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <a href="/" className="hover:text-cyan-400 transition-colors duration-300">
          ← Back to Products
        </a>
      </div>

      <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 to-transparent 
          blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-600/10 to-transparent 
          blur-3xl pointer-events-none" />

        <div className="grid md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden group bg-gradient-to-br from-gray-900 to-gray-800">
              <img 
                src={`http://localhost:8000/static${product.image_path}`}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent 
                opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 
                pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.15), transparent 60%)'
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-cyan-200 
                bg-clip-text text-transparent">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3">
              <p className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 
                bg-clip-text text-transparent text-glow-strong">
                ${parseFloat(product.price).toFixed(2)}
              </p>
              {product.stock > 0 && product.stock < 10 && (
                <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 
                  text-orange-300 text-sm font-medium">
                  Only {product.stock} left in stock!
                </span>
              )}
              {product.stock > 10 && (
                <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 
                  text-green-300 text-sm font-medium">
                  In Stock
                </span>
              )}
            </div>

            {product.description && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-cyan-300">Description</h3>
                <p className="text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}


            {product.stock === 0 && (
              <p className="text-center text-red-400 font-medium">
                This product is currently out of stock
              </p>
            )}

            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg 
                bg-gray-900/30 border border-white/5">
                <span className="text-gray-400">Stock:</span>
                <span className="text-white font-medium">{product.stock} units</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg 
                bg-gray-900/30 border border-white/5">
                <span className="text-gray-400">Id: </span>
                <span className="text-white font-medium">{product.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;