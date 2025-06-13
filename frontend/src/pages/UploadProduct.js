import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API, Storage } from 'aws-amplify';


const UploadProduct = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ file: 0, image: 0 });
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

  // Redirect if not authenticated
  React.useEffect(() => {
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
    const file = files[0];
    
    // Check file size (20MB limit)
    if (file && file.size > 20 * 1024 * 1024) {
      setError(`${name === 'file' ? 'Product file' : 'Image'} exceeds the 20MB size limit.`);
      return;
    }
    
    setFormData({
      ...formData,
      [name]: file
    });
    
    // Clear error if previously set
    if (error) setError('');
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
      
      // 1. Upload files to S3 first (this bypasses API Gateway timeout)
      const productId = Date.now().toString();
      let productFileKey = null;
      let imageKey = null;
      
      // For small files (< 5MB), use Storage.put
      // For larger files, use a different approach
      const isLargeFile = formData.file.size > 5 * 1024 * 1024; // 5MB
      
      // Upload product file
      const fileName = formData.file.name.replace(/\s+/g, '-');
      productFileKey = `products/${productId}-${fileName}`;
      
      console.log('Uploading product file:', productFileKey);
      
      if (isLargeFile) {
        // For large files, use a simpler approach
        console.log('Using simplified upload for large file');
        
        // Create a pre-signed URL for direct upload
        const response = await API.post('api', '/products/upload-url', {
          body: {
            fileName: productFileKey,
            contentType: formData.file.type
          }
        });
        
        // Use the pre-signed URL to upload directly
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', response.uploadURL, true);
        xhr.setRequestHeader('Content-Type', formData.file.type);
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentCompleted = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(prev => ({ ...prev, file: percentCompleted }));
            console.log(`Uploaded: ${event.loaded}/${event.total} (${percentCompleted}%)`);
          }
        };
        
        // Create a promise to wait for the upload to complete
        await new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error('Upload failed'));
          xhr.send(formData.file);
        });
      } else {
        // For small files, use Storage.put
        await Storage.put(
          productFileKey,
          formData.file,
          {
            contentType: formData.file.type,
            progressCallback(progress) {
              const percentCompleted = Math.round((progress.loaded / progress.total) * 100);
              setUploadProgress(prev => ({ ...prev, file: percentCompleted }));
              console.log(`Uploaded: ${progress.loaded}/${progress.total} (${percentCompleted}%)`);
            }
          }
        );
      }
      
      console.log('Product file uploaded successfully');
      
      // Upload image if provided
      if (formData.image) {
        const imageName = formData.image.name.replace(/\s+/g, '-');
        imageKey = `product-images/${productId}-${imageName}`;
        
        console.log('Uploading product image:', imageKey);
        
        // Images are usually smaller, so use Storage.put
        await Storage.put(
          imageKey,
          formData.image,
          {
            contentType: formData.image.type,
            progressCallback(progress) {
              const percentCompleted = Math.round((progress.loaded / progress.total) * 100);
              setUploadProgress(prev => ({ ...prev, image: percentCompleted }));
              console.log(`Image uploaded: ${progress.loaded}/${progress.total} (${percentCompleted}%)`);
            }
          }
        );
        console.log('Product image uploaded successfully');
      }
      
      // 2. Create product in database with file references
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        sellerId: user.username || user.sub,
        status: 'active',
        fileKey: productFileKey,
        imageKey: imageKey,
        imageUrl: imageKey ? `https://${process.env.REACT_APP_S3_BUCKET}.s3.us-east-1.amazonaws.com/public/${imageKey}` : null
      };
      
      // This API call should be quick since files are already uploaded
      console.log('Creating product in database:', productData);
      const createdProduct = await API.post('api', '/products', {
        body: productData
      });
      console.log('Product created successfully:', createdProduct);
      
      setSuccess('Product uploaded successfully!');
      setLoading(false);
      
      // Reset form after success
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Digital Art',
        file: null,
        image: null
      });
      
      // Reset upload progress
      setUploadProgress({ file: 0, image: 0 });
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading product:', error);
      setError(error.message || 'Failed to upload product. Please try again.');
      setLoading(false);
      // Reset upload progress on error
      setUploadProgress({ file: 0, image: 0 });
    }
  };

  const categories = ['Digital Art', 'Templates', 'E-books', 'Software'];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Upload New Product</h1>
        <Link 
          to="/dashboard" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Creator Dashboard
        </Link>
      </div>
      
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
        
        {(uploadProgress.file > 0 || uploadProgress.image > 0) && (
          <div className="mb-4">
            {uploadProgress.file > 0 && (
              <div className="mb-2">
                <div className="text-sm font-medium">Product File: {uploadProgress.file}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress.file}%` }}></div>
                </div>
              </div>
            )}
            {uploadProgress.image > 0 && (
              <div>
                <div className="text-sm font-medium">Product Image: {uploadProgress.image}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${uploadProgress.image}%` }}></div>
                </div>
              </div>
            )}
          </div>
        )}
        
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
    </div>
  );
};

export default UploadProduct;