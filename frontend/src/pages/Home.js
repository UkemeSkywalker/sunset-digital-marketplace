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
      <div className="w-full py-16 bg-gradient-to-r from-sunset-orange to-sunset-yellow text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Discover Amazing Digital Products
          </h1>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Your one-stop marketplace for high-quality digital products from creators around the world
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/products" 
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Browse Products
            </Link>
            <Link 
              to={isAuthenticated ? "/upload-product" : "/register"} 
              className="btn btn-outline text-lg px-8 py-3"
            >
              {isAuthenticated ? "Upload Product" : "Start Creating"}
            </Link>
          </div>
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
      
      {/* Categories */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          <span className="gradient-text">Explore Categories</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div 
              key={index}
              className="card card-hover text-center p-6 flex flex-col items-center"
            >
              <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <p className="text-gray-600 mb-4 text-sm">{category.description}</p>
              <Link 
                to="/products" 
                className="text-primary-600 font-medium hover:text-primary-700 mt-auto"
              >
                Browse {category.name}
              </Link>
            </div>
          ))}
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
  {
    name: "Digital Art",
    description: "Illustrations, graphics, and artwork for your projects",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: "Templates",
    description: "Website, presentation, and document templates",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  },
  {
    name: "E-books",
    description: "Educational guides, tutorials, and books",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    name: "Software",
    description: "Apps, plugins, and digital tools",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }
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