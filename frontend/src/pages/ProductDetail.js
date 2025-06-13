import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from 'aws-amplify';
// import { useAuth } from '../context/AuthContext';
import sampleProducts from '../data/sampleProducts';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response = await API.get('api', `/products/${id}`);
        if (response) {
          setProduct(response);
        } else {
          // If API fails, find product in sample data
          const sampleProduct = sampleProducts.find(p => p.id === id);
          if (sampleProduct) {
            setProduct(sampleProduct);
          } else {
            setError('Product not found');
          }
        }
      } catch (apiError) {
        console.log('Using sample product instead of API data');
        const sampleProduct = sampleProducts.find(p => p.id === id);
        if (sampleProduct) {
          setProduct(sampleProduct);
        } else {
          setError('Product not found');
        }
      }
      
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

  const handleDownload = async () => {
    try {
      setPurchasing(true);
      
      // For sample products
      if (product.id.startsWith('prod-')) {
        // Simulate API call for sample data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPurchasing(false);
        setPurchaseSuccess(true);
        
        // Show success message
        setTimeout(() => {
          setPurchaseSuccess(false);
        }, 3000);
        
        alert('This is a sample product. In a real app, you would download the actual file.');
        return;
      }
      
      // Get download URL from backend
      const response = await API.get('api', `/products/${product.id}/download`);
      
      setPurchasing(false);
      
      if (response && response.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.setAttribute('download', product.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setPurchaseSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setPurchaseSuccess(false);
        }, 3000);
      } else {
        console.error('Download URL not available');
        setError('Unable to download this product. Please try again later.');
      }
    } catch (err) {
      console.error('Error downloading product:', err);
      setPurchasing(false);
      if (err.response && err.response.status === 404) {
        setError('This product has no downloadable file attached.');
      } else {
        setError('Failed to download product. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sunset-orange"></div>
          <p className="mt-4 text-sunset-orange">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <svg className="w-12 h-12 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchProduct}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-600 mb-4">Product not found</p>
        <button 
          onClick={() => navigate('/products')}
          className="btn btn-primary"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="flex mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-sunset-orange"
            >
              Home
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <button 
                onClick={() => navigate('/products')}
                className="ml-1 text-gray-500 hover:text-sunset-orange md:ml-2"
              >
                Products
              </button>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-sunset-orange font-medium md:ml-2 truncate">
                {product.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 relative">
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
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  console.log('Product detail image failed to load:', e.target.src);
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentNode.classList.add('bg-gray-200');
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 md:h-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                <svg className="w-20 h-20 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="bg-sunset-light text-sunset-dark text-xs px-2 py-1 rounded-full font-medium">
                Digital Product
              </span>
            </div>
          </div>
          
          <div className="md:w-1/2 p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">{product.name}</h1>
            <div className="flex items-center mb-6">
              <span className="text-2xl font-bold text-sunset-orange mr-2">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">
                Added {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Description</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
            
            {purchaseSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700">
                    Download started successfully!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleDownload}
                  disabled={purchasing}
                  className={`w-full btn ${purchasing ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
                >
                  {purchasing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Now
                    </div>
                  )}
                </button>
              </>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Free Download</h3>
              <div className="flex items-center text-gray-400 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Instant download
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;