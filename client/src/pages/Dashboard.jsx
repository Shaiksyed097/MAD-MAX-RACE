import { useEffect, useState } from 'react';
import { Calendar, Trophy, Zap, Target, Medal, Timer, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyBookings, getMyResults } from '../services/api';
import { useAuth } from '../context/AuthContext';

const XP_THRESHOLDS = [0, 500, 1500, 3000, 5000, 8000, 12000, 18000, 25000, 35000];
const RANK_COLORS = { 'Rookie': 'text-gray-400', 'Amateur': 'text-green-400', 'Semi-Pro': 'text-blue-400', 'Pro': 'text-purple-400', 'Expert': 'text-yellow-400', 'Elite': 'text-orange-400', 'Champion': 'text-red-400', 'Legend': 'text-pink-400', 'MAD MAX': 'text-orange-500', 'Immortal': 'text-amber-300' };

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (refreshUser) refreshUser();
        const [bRes, rRes] = await Promise.all([
          getMyBookings(),
          getMyResults().catch(() => ({ data: { data: [] } })),
        ]);
        setBookings(bRes.data.data);
        setResults(rRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const getProgress = () => {
    const xp = user?.xp || 0;
    const level = user?.level || 1;
    const current = XP_THRESHOLDS[level - 1] || 0;
    const next = XP_THRESHOLDS[level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + 10000;
    return Math.min(Math.max(((xp - current) / (next - current)) * 100, 0), 100);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 text-orange-500 animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Welcome + Level Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, <span className="gradient-text">{user?.name}</span></h1>
            <p className="text-gray-400 mt-1">Ready to hit the track? 🏍️</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${RANK_COLORS[user?.rank] || 'text-gray-400'}`}>{user?.rank || 'Rookie'}</p>
            <p className="text-gray-400 text-sm">Level {user?.level || 1} · {user?.xp || 0} XP</p>
          </div>
        </div>
        {/* XP Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">{user?.xp || 0} XP</span>
            <span className="text-gray-500">Next Level: {XP_THRESHOLDS[user?.level] || '∞'} XP</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${getProgress()}%` }}></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={<Calendar className="text-blue-400" />} label="Upcoming" value={bookings.filter(b => new Date(b.race?.date) > new Date()).length} />
        <StatCard icon={<Trophy className="text-yellow-400" />} label="Wins" value={user?.wins || 0} />
        <StatCard icon={<Medal className="text-purple-400" />} label="Podiums" value={user?.podiums || 0} />
        <StatCard icon={<Target className="text-green-400" />} label="Total Races" value={user?.totalRaces || 0} />
        <StatCard icon={<Timer className="text-orange-400" />} label="Best Lap" value={user?.bestLapTime || '—'} />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/bookings" className="glass-panel p-5 rounded-xl flex items-center justify-between group hover:border-orange-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-full"><Zap className="text-orange-400" /></div>
            <div><p className="text-white font-bold">Book New Race</p><p className="text-gray-400 text-sm">Browse available races & book slots</p></div>
          </div>
          <ArrowRight className="text-gray-500 group-hover:text-orange-400 transition-colors" />
        </Link>
        <Link to="/leaderboard" className="glass-panel p-5 rounded-xl flex items-center justify-between group hover:border-orange-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-full"><Trophy className="text-yellow-400" /></div>
            <div><p className="text-white font-bold">Leaderboard</p><p className="text-gray-400 text-sm">See rankings, your stats & race history</p></div>
          </div>
          <ArrowRight className="text-gray-500 group-hover:text-yellow-400 transition-colors" />
        </Link>
      </div>

      {/* Recent Results */}
      {results.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-4">Recent Race Results</h3>
          <div className="space-y-3">
            {results.slice(0, 5).map(r => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                    ${r.position === 1 ? 'bg-yellow-500/20 text-yellow-400' : r.position <= 3 ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-gray-400'}`}>
                    {r.position <= 3 ? ['🥇','🥈','🥉'][r.position-1] : `#${r.position}`}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{r.race?.title || 'Race'}</p>
                    <p className="text-gray-500 text-xs">{r.race?.track?.name || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-400 font-mono">{r.lapTime}</span>
                  <span className="text-orange-400 font-bold">+{r.xpEarned} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Bookings */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Your Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No bookings yet. <Link to="/bookings" className="text-orange-400 underline">Book a race →</Link></p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map(b => (
              <div key={b._id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-semibold text-sm">{b.race?.title || 'Race'}</p>
                  <p className="text-gray-500 text-xs">{b.race?.track?.name || ''} · {b.race?.date ? new Date(b.race.date).toLocaleDateString() : ''} · {b.race?.time || ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 font-bold">₹{b.totalAmount}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.paymentStatus === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{b.paymentStatus}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="glass-panel p-4 rounded-xl text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-gray-400 text-xs">{label}</p>
  </div>
);

export default Dashboard;
