import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', age: '' });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name || !formData.email || !formData.password || !formData.age) {
      return toast.error('Please fill in all fields');
    }
    if (Number(formData.age) < 18) {
      return toast.error('You must be at least 18 years old');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setSubmitting(true);
    try {
      const res = await registerUser({
        ...formData,
        age: Number(formData.age),
      });
      login(res.data.token, res.data.user);
      toast.success('🏍️ License granted! Welcome to MAD MAX RACE');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 glass-panel p-8 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-20 -ml-10 -mt-10"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-3xl opacity-15 -mr-10 -mb-10"></div>

      <h2 className="text-3xl font-bold mb-2 text-center text-white">Join MAD MAX RACE</h2>
      <p className="text-center text-gray-400 mb-6 text-sm">Get your racing license and hit the track</p>

      <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="John Doe"
          />
        </div>
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
          <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Must be 18+"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Min 6 characters"
          />
        </div>
        <div className="md:col-span-2 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</> : 'GET LICENSE'}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-gray-400">
        Already have a license? <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">Login</Link>
      </p>
    </div>
  );
};

export default Register;
