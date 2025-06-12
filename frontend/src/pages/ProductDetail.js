import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from 'aws-amplify';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get('api', `/products/${id}`);
      setProduct(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details. Please try again later.');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    try {
      setPurchasing(true);
      
      // Create an order
      await API.post('api', '/orders', {
        body: {
          products: [{ id: product.id, quantity: 1, price: product.price }],
          totalAmount: product.price
        }
      });
      
      // Navigate to orders page
      navigate('/orders', { state: { success: true } });
    } catch (err) {
      console.error('Error purchasing product:', err);
      setPurchasing(false);
      setError('Failed to complete purchase. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchProduct}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Product not found</p>
        <button 
          onClick={() => navigate('/products')}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-64 md:h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-64 md:h-full bg-gray-200 text-gray-400">
                No Image
              </div>
            )}
          </div>
          
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="text-2xl font-bold text-purple-600 mb-6">
              ${product.price.toFixed(2)}
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className={`w-full bg-purple-600 text-white py-3 rounded-md font-medium ${
                purchasing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700'
              }`}
            >
              {purchasing ? 'Processing...' : 'Purchase Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;