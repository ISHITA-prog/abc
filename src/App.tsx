// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster.tsx'; // Explicit .tsx
import { useToast } from './components/ui/use-toast.ts'; // Explicit .ts (common for Shadcn hooks)
import { Button } from './components/ui/button.tsx'; // Explicit .tsx

// Pages/Components
import RegisterForm from './components/RegisterForm.tsx'; // Explicit .tsx
import LoginForm from './components/LoginForm.tsx';     // Explicit .tsx
import Dashboard from './components/Dashboard.tsx';       // Explicit .tsx
import ApplicationForm from './components/ApplicationForm.tsx'; // Explicit .tsx
import ApplicationDetails from './components/ApplicationDetails.tsx'; // Explicit .tsx
import DmDashboard from './components/DmDashboard.tsx';   // Explicit .tsx

// API Base URL (replace with your backend URL when deployed)
const API_BASE_URL = 'http://localhost:5000/api';

// Context for Auth
interface AuthContextType {
  token: string | null;
  user: { id: number; uniqueId: string; email: string; isDmOfficial: boolean } | null;
  login: (token: string, user: unknown) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ id: number; uniqueId: string; email: string; isDmOfficial: boolean } | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  interface User {
  id: number;
  uniqueId: string;
  email: string;
  isDmOfficial: boolean;
}

const login = (newToken: string, userData: User) => {
  setToken(newToken);
  setUser(userData);
  localStorage.setItem('token', newToken);
  localStorage.setItem('user', JSON.stringify(userData));
};
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Unauthorized',
        description: 'Please log in to access this page.',
        variant: 'destructive',
      });
      navigate('/login');
    } else if (roles && user && !roles.includes(user.isDmOfficial ? 'dm_official' : 'vendor')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
      navigate('/dashboard'); // Redirect to a default page if role doesn't match
    }
  }, [token, user, navigate, roles, toast]);

  if (!token || (roles && user && !roles.includes(user.isDmOfficial ? 'dm_official' : 'vendor'))) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};


// Main App Component
function App() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold rounded-md px-2 py-1 hover:bg-white hover:text-blue-600 transition-colors">
            Vendor Portal
          </Link>
          <div className="space-x-4">
            {!token ? (
              <>
                <Link to="/register">
                  <Button variant="ghost" className="text-white hover:bg-white hover:text-blue-600 rounded-md">Register</Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:bg-white hover:text-blue-600 rounded-md">Login</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-white hover:bg-white hover:text-blue-600 rounded-md">Dashboard</Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-white hover:text-blue-600 rounded-md">Logout</Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <h1 className="text-5xl font-extrabold text-gray-800 mb-4 animate-fadeIn">Welcome to the Vendor Empanelment Portal</h1>
              <p className="text-lg text-gray-600 mb-8 animate-slideUp">Your gateway to seamless vendor applications and management.</p>
              {!token ? (
                <div className="space-x-4 animate-bounceIn">
                  <Link to="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-md px-6 py-3 text-lg">Get Started (Register)</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 shadow-lg rounded-md px-6 py-3 text-lg">Login</Button>
                  </Link>
                </div>
              ) : (
                <Link to="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-md px-6 py-3 text-lg animate-bounceIn">Go to Dashboard</Button>
                </Link>
              )}
            </div>
          } />
          <Route path="/register" element={<RegisterForm API_BASE_URL={API_BASE_URL} />} />
          <Route path="/login" element={<LoginForm API_BASE_URL={API_BASE_URL} />} />

          {/* Protected Routes for Vendors */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
          <Route path="/apply/:department" element={<ProtectedRoute><ApplicationForm API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />
          <Route path="/application/:id" element={<ProtectedRoute><ApplicationDetails API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

          {/* Protected Route for DMRC Officials */}
          <Route path="/dm-dashboard" element={<ProtectedRoute roles={['dm_official']}><DmDashboard API_BASE_URL={API_BASE_URL} /></ProtectedRoute>} />

          {/* Fallback for unknown routes */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <h1 className="text-6xl font-extrabold text-red-500 mb-4">404</h1>
              <p className="text-xl text-gray-700 mb-8">Page Not Found</p>
              <Link to="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-md px-6 py-3 text-lg">Go to Home</Button>
              </Link>
            </div>
          } />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

// Wrap App with AuthProvider for context
const RootApp: React.FC = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default RootApp;
