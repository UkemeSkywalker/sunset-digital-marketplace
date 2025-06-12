import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full py-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Sunset Digital Marketplace</h1>
        <p className="text-xl mb-8">Discover and purchase digital products from creators around the world</p>
        <Link 
          to="/products" 
          className="bg-white text-purple-600 px-6 py-3 rounded-md text-lg font-medium hover:bg-purple-100"
        >
          Browse Products
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto py-12">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-purple-600 text-4xl font-bold mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Browse Products</h3>
            <p className="text-gray-600">Explore our marketplace of digital products created by talented sellers.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-purple-600 text-4xl font-bold mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Make a Purchase</h3>
            <p className="text-gray-600">Securely buy the digital products you love with just a few clicks.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-purple-600 text-4xl font-bold mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Download & Enjoy</h3>
            <p className="text-gray-600">Instantly access your purchases and start using them right away.</p>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Become a Seller</h2>
          <p className="text-xl mb-6">Have digital products to sell? Join our marketplace and reach customers worldwide.</p>
          <Link 
            to="/register" 
            className="bg-purple-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-purple-700"
          >
            Start Selling Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;