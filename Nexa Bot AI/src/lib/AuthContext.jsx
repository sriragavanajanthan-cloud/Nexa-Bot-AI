import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const userEmail = localStorage.getItem('nexabot_user_email');
      
      if (userEmail) {
        setUser({ email: userEmail, id: userEmail });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setAuthError(null);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const logout = (shouldRedirect = true) => {
    // Clear user data from localStorage
    localStorage.removeItem('nexabot_user_email');
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to home page if needed
    if (shouldRedirect) {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    // Since we're using EmailJS OTP, just clear any existing session
    localStorage.removeItem('nexabot_user_email');
    window.location.href = '/';
  };

  // Optional: Add method to update user after successful login
  const setUserFromEmail = (email) => {
    if (email) {
      setUser({ email: email, id: email });
      setIsAuthenticated(true);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkUserAuth,
      setUserFromEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
