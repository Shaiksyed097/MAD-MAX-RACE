import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Bookings from './pages/Bookings';
import Leaderboard from './pages/Leaderboard';

// Protected route wrapper
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen text-white text-xl">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

// Redirect if already logged in
const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen text-white text-xl">Loading...</div>;
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} />;
  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
            <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" theme="dark" autoClose={3000} />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
