import React from 'react';
import { Link } from 'react-router-dom';

const HomeProductCard = ({ product }) => {
  return (
    <Link 
      to={`/products/${product.id}`} 
      className="card card-hover flex flex-col h-full"
    >
      <div className="h-64 bg-gray-100 relative overflow-hidden">
        {product.imageKey || product.imageUrl ? (
          <img 
            src={
              product.imageKey 
                ? `https://${process.env.REACT_APP_S3_BUCKET}.s3.us-east-1.amazonaws.com/public/${product.imageKey.replace(/^public\//, '')}`
                : product.imageUrl
            } 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
          <div className="flex justify-between items-center">
            <span className="bg-sunset-light text-sunset-dark text-xs px-2 py-1 rounded-full font-medium">
              ${product.price.toFixed(2)}
            </span>
            <div className="text-white hover:text-sunset-light">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HomeProductCard;