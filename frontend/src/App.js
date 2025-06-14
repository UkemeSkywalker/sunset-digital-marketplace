import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import CreatorDashboard from './pages/CreatorDashboard';
import UploadProduct from './pages/UploadProduct';
import Profile from './pages/Profile';

// Configure Amplify
const awsConfig = {
  Auth: {
    region: process.env.REACT_APP_REGION,
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
    identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
  },
  Storage: {
    AWSS3: {
      bucket: process.env.REACT_APP_S3_BUCKET,
      region: process.env.REACT_APP_REGION,
    }
  },
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: process.env.REACT_APP_API_URL,
      },
    ],
  },
};

Amplify.configure(awsConfig);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/dashboard" element={<CreatorDashboard />} />
              <Route path="/upload-product" element={<UploadProduct />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;