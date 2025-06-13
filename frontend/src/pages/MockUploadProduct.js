import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MockUploadProduct = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Digital Art',
    file: null,
    image: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Basic validation
      if (!formData.name || !formData.description || !formData.price || !formData.file) {
        throw new Error('Please fill all required fields');
      }
      
      // Mock file upload - just store file info
      const newUpload = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        fileName: formData.file.name,
        fileSize: formData.file.size,
        fileType: formData.file.type,
        imageName: formData.image ? formData.image.name : null,
        uploadDate: new Date().toISOString(),
        seller: user.username
      };
      
      // Add to mock database
      setUploadedFiles(prev => [...prev, newUpload]);
      
      // Show success message
      setSuccess('Product uploaded successfully!');
      setLoading(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Digital Art',
        file: null,
        image: null
      });
      
      // In a real app, we would redirect to dashboard
      // For testing, we'll just show the uploaded files
      
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const categories = ['Digital Art', 'Templates', 'E-books', 'Software'];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Upload New Product (Mock Version)</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            rows="4"
            required
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Price ($) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Product File *</label>
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload the actual product file that customers will download after purchase
          </p>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Product Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload a preview image for your product (recommended)
          </p>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="btn btn-primary px-6 py-3"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Product'}
          </button>
        </div>
      </form>
      
      {uploadedFiles.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Uploaded Products</h2>
          <div className="space-y-4">
            {uploadedFiles.map(product => (
              <div key={product.id} className="border p-4 rounded">
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">Price:</span> ${product.price}</div>
                  <div><span className="font-semibold">Category:</span> {product.category}</div>
                  <div><span className="font-semibold">File:</span> {product.fileName}</div>
                  <div><span className="font-semibold">Image:</span> {product.imageName || 'None'}</div>
                  <div><span className="font-semibold">Uploaded:</span> {new Date(product.uploadDate).toLocaleString()}</div>
                  <div><span className="font-semibold">Seller:</span> {product.seller}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockUploadProduct;