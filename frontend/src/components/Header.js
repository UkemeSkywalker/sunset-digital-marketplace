import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className="mr-2">🌅</span>
            <span className="hidden sm:inline">Sunset Marketplace</span>
            <span className="sm:hidden">Sunset</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="hover:text-primary-100 transition-colors">
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/orders" className="hover:text-primary-100 transition-colors">
                  My Orders
                </Link>
                <Link to="/dashboard" className="hover:text-primary-100 transition-colors">
                  Creator Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center hover:text-primary-100">
                    <span className="mr-1">Account</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      Signed in as<br />
                      <span className="font-medium">{user?.email || 'User'}</span>
                    </div>
                    <button 
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="btn btn-secondary"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-outline"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-primary-500">
            <Link 
              to="/products" 
              className="block py-2 hover:bg-primary-500 px-2 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/orders" 
                  className="block py-2 hover:bg-primary-500 px-2 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link 
                  to="/dashboard" 
                  className="block py-2 hover:bg-primary-500 px-2 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Creator Dashboard
                </Link>
                <button 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 hover:bg-primary-500 px-2 rounded"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 mt-2">
                <Link 
                  to="/login" 
                  className="btn btn-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-outline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;