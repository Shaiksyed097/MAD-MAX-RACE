import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return toast.error('Please fill in all fields');
    }

    setSubmitting(true);
    try {
      const res = await loginUser(formData);
      login(res.data.token, res.data.user);
      toast.success(`🏁 Welcome back, ${res.data.user.name}!`);
      // Redirect based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 glass-panel p-8 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>

      <h2 className="text-3xl font-bold mb-2 text-center text-white">Welcome Back</h2>
      <p className="text-center text-gray-400 mb-6 text-sm">Fire up your engine</p>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="rider@madmax.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Igniting...</> : 'START ENGINE'}
        </button>
      </form>
      <p className="mt-6 text-center text-gray-400">
        Don't have a license yet? <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium">Register</Link>
      </p>
    </div>
  );
};

export default Login;
