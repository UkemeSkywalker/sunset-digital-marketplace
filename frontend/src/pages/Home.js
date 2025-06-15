import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from 'aws-amplify';
import sampleProducts from '../data/sampleProducts';
import { useAuth } from '../context/AuthContext';
import HomeProductCard from '../components/HomeProductCard';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchProducts();
    
    // Set up polling to check for new products every 30 seconds
    const intervalId = setInterval(fetchProducts, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Try to fetch from API first
      try {
        const response = await API.get('api', '/products');
        if (response && response.length > 0) {
          setProducts(response);
        } else {
          // If API returns empty array or fails, use sample data
          setProducts(sampleProducts);
        }
      } catch (apiError) {
        console.log('Using sample products instead of API data');
        setProducts(sampleProducts);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full py-24 bg-white flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900 font-sans">
            The Top 1% of Creators Share Here
          </h1>
          <h3 className="text-xl md:text-2xl mb-10 text-gray-600 max-w-2xl mx-auto font-sans">
            Download Stunning Assets. Fuel Your Next Big Project.
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/products" 
              className="px-8 py-3 bg-sunset-orange text-white text-lg rounded-md hover:bg-sunset-dark transition-colors"
            >
              Browse Products
            </Link>
            <Link 
              to={isAuthenticated ? "/upload-product" : "/register"} 
              className="px-8 py-3 border-2 border-sunset-orange text-sunset-orange text-lg rounded-md hover:bg-sunset-orange hover:text-white transition-colors"
            >
              {isAuthenticated ? "Upload Product" : "Start Creating"}
            </Link>
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          <span className="gradient-text">Explore Categories</span>
        </h2>
        
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category, index) => (
            <Link 
              key={index}
              to="/products" 
              className="px-6 py-2 border border-sunset-orange text-sunset-orange hover:bg-sunset-orange hover:text-white transition-colors rounded-[3em]"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Products Section */}
      <div className="max-w-6xl mx-auto py-16 px-4 w-full">
        <h2 className="text-3xl font-bold text-center mb-8">
          <span className="gradient-text">Discover Digital Products</span>
        </h2>
        
        {loading && products.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map(product => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link 
            to="/products" 
            className="btn btn-primary"
          >
            View All Products
          </Link>
        </div>
      </div>
      

      
      {/* How It Works */}
      <div className="w-full bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="card p-6 text-center h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <svg className="w-8 h-8 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="w-full bg-gradient-to-r from-sunset-orange to-sunset-yellow text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join our community of buyers and creators today and discover the best digital products on the market.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to={isAuthenticated ? "/upload-product" : "/register"} 
              className="btn btn-secondary text-lg px-8 py-3"
            >
              {isAuthenticated ? "Upload Product" : "Create Account"}
            </Link>
            <Link 
              to="/products" 
              className="btn btn-outline text-lg px-8 py-3"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sample data
const categories = [
  { name: "Digital Art" },
  { name: "Templates" },
  { name: "E-books" },
  { name: "Software" },
  { name: "Graphics" },
  { name: "Audio" },
  { name: "Video" },
  { name: "Photography" }
];

const steps = [
  {
    title: "Browse Products",
    description: "Explore our marketplace of digital products created by talented creators from around the world."
  },
  {
    title: "Create & Sell",
    description: "Upload your own digital creations and reach customers worldwide with our easy-to-use platform."
  },
  {
    title: "Download & Enjoy",
    description: "Instantly access your purchases and start using them right away. No waiting, no shipping!"
  }
];

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Graphic Designer",
    rating: 5,
    text: "I've found amazing design resources on this marketplace that have saved me countless hours of work."
  },
  {
    name: "Sarah Williams",
    role: "Digital Creator",
    rating: 5,
    text: "As a creator, I love how easy it is to list my products and reach customers worldwide."
  },
  {
    name: "Michael Chen",
    role: "Web Developer",
    rating: 4,
    text: "The quality of templates I've purchased here is outstanding. Highly recommended for any developer."
  }
];

export default Home;