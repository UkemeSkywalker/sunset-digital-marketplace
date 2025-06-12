import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Sunset Marketplace</Link>
        
        <nav className="flex items-center space-x-6">
          <Link to="/products" className="hover:text-purple-200">Products</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="hover:text-purple-200">My Orders</Link>
              {user?.groups?.includes('sellers') && (
                <Link to="/dashboard" className="hover:text-purple-200">Seller Dashboard</Link>
              )}
              <button 
                onClick={signOut}
                className="bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-purple-100"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-purple-100"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-transparent border border-white px-4 py-2 rounded-md hover:bg-white hover:text-purple-600"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;