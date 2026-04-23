import { Link, useNavigate } from 'react-router-dom';
import { Bike, LogIn, User, LogOut, LayoutDashboard, ShieldCheck, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <Bike className="text-orange-500 h-8 w-8 group-hover:animate-bounce" />
          <span className="font-bold text-2xl tracking-widest text-white uppercase">
            MAD MAX <span className="font-light text-gray-400 text-sm tracking-normal">RACE</span>
          </span>
        </Link>
        <div className="flex items-center space-x-5">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 font-medium">
                <LogIn className="w-4 h-4" /> Login
              </Link>
              <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95">
                RIDE NOW
              </Link>
            </>
          ) : (
            <>
              <span className="text-gray-400 text-sm hidden md:block">
                Hey, <span className="text-orange-400 font-semibold">{user?.name}</span>
              </span>
              {user?.role === 'admin' ? (
                <Link to="/admin" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-400" /> Admin Panel
                </Link>
              ) : (
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              )}
              <Link to="/bookings" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
                <User className="w-4 h-4" /> Bookings
              </Link>
              <Link to="/leaderboard" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-400" /> Leaderboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
