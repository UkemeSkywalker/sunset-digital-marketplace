import React, { useState, useEffect, useCallback } from 'react';
import { API } from 'aws-amplify';
import { useAuth } from '../context/AuthContext';

const CreatorDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCreatorProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Get all products
      const response = await API.get('api', '/products');
      console.log('API Response:', response);
      console.log('User:', user);
      
      // Filter products by creator ID
      // Use both user.sub (Cognito ID) and user.username (if available) to match creatorId
      const creatorId = user.username || user.sub;
      console.log('Looking for creatorId:', creatorId);
      
      // Check if response is an array
      if (!Array.isArray(response)) {
        console.error('Response is not an array:', response);
        setProducts([]);
        setLoading(false);
        return;
      }
      
      const creatorProducts = response.filter(product => {
        console.log('Product:', product);
        return product.sellerId === creatorId;
      });
      
      console.log('Filtered products:', creatorProducts);
      setProducts(creatorProducts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching creator products:', err);
      setError('Failed to load your products. Please try again later.');
      setLoading(false);
    }
  }, [user]);
  
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await API.del('api', `/products/${productId}`);
      
      // Show success message
      setError(null);
      setSuccess('Product deleted successfully');
      
      // Refresh the product list
      fetchCreatorProducts();
      
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorProducts();
  }, [fetchCreatorProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (!formData.name || !formData.description || !formData.price) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create product
      await API.post('api', '/products', {
        body: {
          ...formData,
          creatorId: user.sub
        }
      });
      
      // Reset form and refresh products
      setFormData({
        name: '',
        description: '',
        price: '',
        imageUrl: ''
      });
      setShowForm(false);
      fetchCreatorProducts();
    } catch (err) {
      console.error('Error creating product:', err);
      setFormError('Failed to create product. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <div className="ml-4">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          {showForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}
      
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className={`w-full bg-purple-600 text-white py-2 rounded-md font-medium ${
                submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700'
              }`}
            >
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </form>
        </div>
      )}
      
      <h2 className="text-xl font-semibold mb-4">Your Products</h2>
      
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">You haven't created any products yet.</p>
          <a
            href="/upload-product"
            className="text-purple-600 hover:underline"
          >
            Add Your First Product
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {product.imageKey || product.imageUrl ? (
                          <img 
                            src={
                              product.imageKey 
                                ? `https://${process.env.REACT_APP_S3_BUCKET}.s3.us-east-1.amazonaws.com/public/${product.imageKey.replace(/^public\//, '')}`
                                : product.imageUrl && product.imageUrl.includes('amazonaws.com') 
                                  ? product.imageUrl.replace('s3.amazonaws.com', 's3.us-east-1.amazonaws.com').replace('product-images/', 'public/product-images/')
                                  : product.imageUrl
                            } 
                            alt={product.name}
                            className="h-10 w-10 rounded-full object-cover" 
                            onError={(e) => {
                              console.log('Image failed to load:', e.target.src);
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentNode.classList.add('bg-gray-300');
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href={`/products/${product.id}`} className="text-purple-600 hover:text-purple-900 mr-4">
                      View
                    </a>
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)} 
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;