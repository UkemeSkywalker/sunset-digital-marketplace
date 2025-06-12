import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link 
      to={`/products/${product.id}`} 
      className="card card-hover flex flex-col h-full"
    >
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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
          <span className="text-xs text-gray-500">
            {new Date(product.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;