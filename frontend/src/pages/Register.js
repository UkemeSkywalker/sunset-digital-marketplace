import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { signUp, confirmSignUp } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      await signUp(email, password, name);
      setShowConfirmation(true);
      setLoading(false);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
      setLoading(false);
    }
  };
  
  const handleConfirmation = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      await confirmSignUp(email, confirmationCode);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      console.error('Confirmation error:', err);
      setError(err.message || 'Failed to confirm registration. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Create an Account</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!showConfirmation ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
              minLength={8}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 text-white py-2 rounded-md font-medium ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirmation} className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4 text-gray-700">
            We've sent a confirmation code to your email. Please enter it below to complete your registration.
          </p>
          
          <div className="mb-6">
            <label htmlFor="code" className="block text-gray-700 font-medium mb-2">
              Confirmation Code
            </label>
            <input
              type="text"
              id="code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 text-white py-2 rounded-md font-medium ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            {loading ? 'Confirming...' : 'Confirm Registration'}
          </button>
        </form>
      )}
      
      <p className="mt-4 text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-purple-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Register;