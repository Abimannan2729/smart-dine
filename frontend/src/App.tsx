import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { ThemeProvider } from './context/ThemeContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ThemeToggle from './components/ui/ThemeToggle';

// Lazy load components
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Login = React.lazy(() => import('./components/auth/Login'));
const Register = React.lazy(() => import('./components/auth/Register'));
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));
const MenuDashboard = React.lazy(() => import('./components/menu/MenuDashboard'));
const PublicMenu = React.lazy(() => import('./components/public/PublicMenu'));
const SimplePublicMenu = React.lazy(() => import('./components/public/SimplePublicMenu'));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  
  if (state.loading) {
    return <LoadingSpinner />;
  }
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <RestaurantProvider>
      {children}
    </RestaurantProvider>
  );
};

// Public Route Component for auth pages (redirect if authenticated)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  
  if (state.loading) {
    return <LoadingSpinner />;
  }
  
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (no auth required)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Menu Dashboard Wrapper to extract restaurant ID from URL
const MenuDashboardWrapper: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  
  if (!restaurantId) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <MenuDashboard restaurantId={restaurantId} />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Landing Page - No auth required */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />
          
          {/* Auth Routes - Redirect if authenticated */}
          <Route 
            path="/login" 
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            } 
          />
          
          
          {/* Test Route */}
          <Route path="/test" element={<div className="p-8"><h1 className="text-2xl font-bold">Test Route Working!</h1></div>} />
          
          {/* Public Menu Routes */}
          <Route path="/menu/:slug" element={<SimplePublicMenu />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/restaurants/:restaurantId/menu" 
            element={
              <ProtectedRoute>
                <MenuDashboardWrapper />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirects - only catch truly unmatched routes */}
          <Route path="*" element={<div className="p-8"><h1 className="text-2xl font-bold text-red-600">404 - Page Not Found</h1><p>Route: {window.location.pathname}</p></div>} />
        </Routes>
      </React.Suspense>
      
      {/* Global Floating Theme Toggle - Available on all pages */}
      <ThemeToggle variant="floating" size="md" />
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #363636)',
            color: 'var(--toast-color, #fff)',
          },
          success: {
            style: {
              background: 'var(--toast-success-bg, #059669)',
            },
          },
          error: {
            style: {
              background: 'var(--toast-error-bg, #DC2626)',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
