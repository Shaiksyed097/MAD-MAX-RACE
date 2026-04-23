import { useEffect, useState } from 'react';
import { Trophy, Star, Medal, Flame, Loader2, Crown, Target, Zap, Timer } from 'lucide-react';
import { getLeaderboard, getMyResults } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RANK_COLORS = {
  'Rookie': 'text-gray-400',
  'Amateur': 'text-green-400',
  'Semi-Pro': 'text-blue-400',
  'Pro': 'text-purple-400',
  'Expert': 'text-yellow-400',
  'Elite': 'text-orange-400',
  'Champion': 'text-red-400',
  'Legend': 'text-pink-400',
  'MAD MAX': 'text-orange-500',
  'Immortal': 'text-amber-300',
};

const RANK_BG = {
  'Rookie': 'bg-gray-500/10',
  'Amateur': 'bg-green-500/10',
  'Semi-Pro': 'bg-blue-500/10',
  'Pro': 'bg-purple-500/10',
  'Expert': 'bg-yellow-500/10',
  'Elite': 'bg-orange-500/10',
  'Champion': 'bg-red-500/10',
  'Legend': 'bg-pink-500/10',
  'MAD MAX': 'bg-orange-500/20',
  'Immortal': 'bg-amber-500/20',
};

const XP_THRESHOLDS = [0, 500, 1500, 3000, 5000, 8000, 12000, 18000, 25000, 35000];

const Leaderboard = () => {
  const { user, refreshUser } = useAuth();
  const [riders, setRiders] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('leaderboard'); // 'leaderboard' | 'myStats'

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (refreshUser) refreshUser();
      const [lbRes, mrRes] = await Promise.all([
        getLeaderboard(),
        user ? getMyResults().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })
      ]);
      setRiders(lbRes.data.data);
      setMyResults(mrRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Progress to next level
  const getProgressToNext = (xp, level) => {
    const current = XP_THRESHOLDS[level - 1] || 0;
    const next = XP_THRESHOLDS[level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + 10000;
    const progress = ((xp - current) / (next - current)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 text-orange-500 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Trophy className="text-yellow-400" /> Leaderboard</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('leaderboard')} className={`px-4 py-2 rounded-lg font-medium text-sm cursor-pointer ${tab === 'leaderboard' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>🏆 Global Rankings</button>
          {user && <button onClick={() => setTab('myStats')} className={`px-4 py-2 rounded-lg font-medium text-sm cursor-pointer ${tab === 'myStats' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>📊 My Stats</button>}
        </div>
      </div>

      {tab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Top 3 Podium */}
          {riders.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[riders[1], riders[0], riders[2]].map((r, i) => {
                const pos = i === 0 ? 2 : i === 1 ? 1 : 3;
                const sizes = { 1: 'h-40', 2: 'h-32', 3: 'h-28' };
                const colors = { 1: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/50', 2: 'from-gray-400/20 to-gray-500/5 border-gray-400/50', 3: 'from-amber-700/20 to-amber-800/5 border-amber-700/50' };
                const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
                return (
                  <div key={r._id} className={`glass-panel rounded-2xl p-5 text-center border bg-gradient-to-b ${colors[pos]} ${pos === 1 ? 'order-2 -mt-4' : pos === 2 ? 'order-1 mt-4' : 'order-3 mt-6'}`}>
                    <div className="text-3xl mb-2">{medals[pos]}</div>
                    <p className="text-white font-bold text-lg">{r.name}</p>
                    <p className={`text-sm font-semibold ${RANK_COLORS[r.rank] || 'text-gray-400'}`}>{r.rank}</p>
                    <p className="text-orange-400 font-bold text-xl mt-2">{r.xp} XP</p>
                    <p className="text-gray-500 text-xs mt-1">Level {r.level} · {r.wins}W · {r.podiums}P</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-slate-700 bg-slate-800/30">
                <tr>
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Rider</th>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4 text-center">Level</th>
                  <th className="py-3 px-4 text-center">XP</th>
                  <th className="py-3 px-4 text-center">Wins</th>
                  <th className="py-3 px-4 text-center">Podiums</th>
                  <th className="py-3 px-4 text-center">Races</th>
                  <th className="py-3 px-4 text-center">Best Lap</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((r, i) => {
                  const isMe = user && r._id === user.id;
                  return (
                    <tr key={r._id} className={`border-b border-slate-800 transition-colors ${isMe ? 'bg-orange-500/10' : 'hover:bg-slate-800/30'}`}>
                      <td className="py-3 px-4 font-bold text-gray-400">{i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}</td>
                      <td className="py-3 px-4 text-white font-semibold">{r.name} {isMe && <span className="text-orange-400 text-xs">(You)</span>}</td>
                      <td className="py-3 px-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${RANK_BG[r.rank]} ${RANK_COLORS[r.rank]}`}>{r.rank}</span></td>
                      <td className="py-3 px-4 text-center text-white font-bold">{r.level}</td>
                      <td className="py-3 px-4 text-center text-orange-400 font-bold">{r.xp}</td>
                      <td className="py-3 px-4 text-center text-yellow-400 font-bold">{r.wins}</td>
                      <td className="py-3 px-4 text-center text-gray-300">{r.podiums}</td>
                      <td className="py-3 px-4 text-center text-gray-300">{r.totalRaces}</td>
                      <td className="py-3 px-4 text-center text-green-400 font-mono">{r.bestLapTime || '—'}</td>
                    </tr>
                  );
                })}
                {riders.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-gray-500">No riders ranked yet. Race to climb the board!</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'myStats' && user && (
        <div className="space-y-6">
          {/* Level Card */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Your Rank</p>
                <h2 className={`text-3xl font-bold ${RANK_COLORS[user.rank] || 'text-gray-400'}`}>{user.rank || 'Rookie'}</h2>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Level</p>
                <p className="text-4xl font-bold text-white">{user.level || 1}</p>
              </div>
            </div>
            {/* XP Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{user.xp || 0} XP</span>
                <span className="text-gray-500">Next: {XP_THRESHOLDS[user.level] || '∞'} XP</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${getProgressToNext(user.xp || 0, user.level || 1)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox icon={<Crown className="text-yellow-400" />} label="Wins" value={user.wins || 0} />
            <StatBox icon={<Medal className="text-purple-400" />} label="Podiums" value={user.podiums || 0} />
            <StatBox icon={<Target className="text-blue-400" />} label="Total Races" value={user.totalRaces || 0} />
            <StatBox icon={<Timer className="text-green-400" />} label="Best Lap" value={user.bestLapTime || '—'} />
          </div>

          {/* Race History */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Race History</h3>
            {myResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No race results yet. Book and complete a race to see your results!</p>
            ) : (
              <div className="space-y-3">
                {myResults.map(r => (
                  <div key={r._id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                        ${r.position === 1 ? 'bg-yellow-500/20 text-yellow-400' : r.position === 2 ? 'bg-gray-400/20 text-gray-300' : r.position === 3 ? 'bg-amber-700/20 text-amber-500' : 'bg-slate-700 text-gray-400'}`}>
                        {r.position <= 3 ? ['🥇','🥈','🥉'][r.position-1] : `#${r.position}`}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{r.race?.title || 'Race'}</p>
                        <p className="text-gray-400 text-xs">{r.race?.track?.name || ''} · {r.race?.date ? new Date(r.race.date).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400 font-mono">{r.lapTime}</span>
                      <span className="text-orange-400 font-bold">+{r.xpEarned} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Level Roadmap */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Zap className="text-yellow-400" /> Level Roadmap</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { level: 1, rank: 'Rookie', xp: 0 },
                { level: 2, rank: 'Amateur', xp: 500 },
                { level: 3, rank: 'Semi-Pro', xp: 1500 },
                { level: 4, rank: 'Pro', xp: 3000 },
                { level: 5, rank: 'Expert', xp: 5000 },
                { level: 6, rank: 'Elite', xp: 8000 },
                { level: 7, rank: 'Champion', xp: 12000 },
                { level: 8, rank: 'Legend', xp: 18000 },
                { level: 9, rank: 'MAD MAX', xp: 25000 },
                { level: 10, rank: 'Immortal', xp: 35000 },
              ].map(t => {
                const unlocked = (user.xp || 0) >= t.xp;
                return (
                  <div key={t.level} className={`p-3 rounded-xl border text-center transition-all ${unlocked ? `border-orange-500/50 ${RANK_BG[t.rank]}` : 'border-slate-700 opacity-50'}`}>
                    <p className="text-2xl">{unlocked ? '🔓' : '🔒'}</p>
                    <p className={`font-bold text-sm ${unlocked ? RANK_COLORS[t.rank] : 'text-gray-500'}`}>{t.rank}</p>
                    <p className="text-gray-500 text-xs">Lv.{t.level} · {t.xp}XP</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ icon, label, value }) => (
  <div className="glass-panel p-5 rounded-xl text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-gray-400 text-sm">{label}</p>
  </div>
);

export default Leaderboard;
