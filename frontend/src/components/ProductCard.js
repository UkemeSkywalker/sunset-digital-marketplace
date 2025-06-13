import React from 'react';
import { Link } from 'react-router-dom';
import { API } from 'aws-amplify';

const ProductCard = ({ product }) => {
  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // For demo purposes with sample products that don't exist in S3
      if (product.id.startsWith('prod-')) {
        // Create a mock download for sample products
        alert('This is a sample product. In a real app, you would download the actual file.');
        return;
      }
      
      // For products with only image and no file
      if (!product.fileKey && product.imageKey) {
        console.log('Product has no file, using image instead');
      }
      
      // Get download URL from backend
      const response = await API.get('api', `/products/${product.id}/download`);
      
      if (response && response.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.setAttribute('download', product.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Download URL not available');
        alert('Unable to download this product. Please try again later.');
      }
    } catch (error) {
      console.error('Error downloading product:', error);
      if (error.response && error.response.status === 404) {
        alert('This product has no downloadable file attached.');
      } else {
        alert('Unable to download this product. Please try again later.');
      }
    }
  };
  return (
    <Link 
      to={`/products/${product.id}`} 
      className="card card-hover flex flex-col h-full"
    >
      <div className="h-48 bg-gray-100 relative overflow-hidden">
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
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              console.log('Product card image failed to load:', e.target.src);
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentNode.classList.add('bg-gray-200');
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
            <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="bg-sunset-light text-sunset-dark text-xs px-2 py-1 rounded-full font-medium">
            Digital
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h2>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2 flex-grow">{product.description}</p>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-sunset-orange font-bold">${product.price.toFixed(2)}</span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
            <button 
              onClick={handleDownload}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Download product"
            >
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;