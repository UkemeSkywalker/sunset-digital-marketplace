import React, { createContext, useState, useContext, useEffect } from 'react';
import { Auth } from 'aws-amplify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const user = await Auth.signIn(email, password);
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const { user } = await Auth.signUp({
        username: email,
        password,
        attributes: {
          name,
        },
      });
      return user;
    } catch (error) {
      throw error;
    }
  };

  const confirmSignUp = async (email, code) => {
    try {
      await Auth.confirmSignUp(email, code);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};