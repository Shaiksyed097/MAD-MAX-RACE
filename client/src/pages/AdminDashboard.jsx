import { useEffect, useState } from 'react';
import { Users, AlertTriangle, Calendar, IndianRupee, Loader2, Plus, MapPin, CheckCircle, Bike, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAdminStats, getRaces, getTracks, createRace, createTrack, getBikes, createBike, deleteBike, getGear, createGearItem, getAllBookings, publishResults } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [races, setRaces] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [gearItems, setGearItems] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'track' | 'race' | 'bike' | 'gear'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'races' | 'bikes' | 'bookings'

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, racesRes, tracksRes, bikesRes, gearRes, bookingsRes] = await Promise.all([
        getAdminStats(), getRaces(), getTracks(), getBikes(), getGear(), getAllBookings().catch(() => ({ data: { data: [] } }))
      ]);
      setStats(statsRes.data.data);
      setRaces(racesRes.data.data);
      setTracks(tracksRes.data.data);
      setBikes(bikesRes.data.data);
      setGearItems(gearRes.data.data);
      setAllBookings(bookingsRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeleteBike = async (id) => {
    try {
      await deleteBike(id);
      toast.success('Bike removed');
      fetchAll();
    } catch (err) { toast.error('Failed to delete bike'); }
  };

  const handleSimulateRace = async (raceId) => {
    const raceBookings = allBookings.filter(b => b.race?._id === raceId && b.paymentStatus === 'completed');
    if (raceBookings.length === 0) {
      return toast.error('No completed bookings for this race yet! Book a spot first to simulate.');
    }
    
    // Create random results from the bookings
    const results = raceBookings.map((b, index) => ({
      riderId: b.user._id,
      position: index + 1,
      lapTime: `1:${40 + Math.floor(Math.random() * 15)}.${Math.floor(Math.random() * 900) + 100}`,
      penalties: 0,
      remarks: 'Simulated race for demo'
    }));

    const loadingToast = toast.loading('Simulating race & sending result emails...');
    try {
      await publishResults({ raceId, results });
      toast.dismiss(loadingToast);
      toast.success('🏁 Race completed! XP awarded and Leaderboard updated.');
      fetchAll();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'Failed to simulate race');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 text-orange-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Race Control</h1>
          <p className="text-red-400 font-medium tracking-wide text-sm uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Admin Panel
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'races', label: `Races (${races.length})` },
          { key: 'bikes', label: `Bikes & Gear` },
          { key: 'bookings', label: `Bookings (${allBookings.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer
              ${activeTab === tab.key ? 'bg-orange-500 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ──── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users className="text-blue-400" />} title="Total Riders" value={stats?.totalRiders ?? 0} bg="bg-blue-500/10" />
            <StatCard icon={<Calendar className="text-purple-400" />} title="Total Races" value={stats?.totalRaces ?? 0} bg="bg-purple-500/10" />
            <StatCard icon={<IndianRupee className="text-green-400" />} title="Revenue" value={`₹${stats?.totalRevenue ?? 0}`} bg="bg-green-500/10" />
            <StatCard icon={<CheckCircle className="text-orange-400" />} title="Bookings" value={stats?.totalBookings ?? 0} bg="bg-orange-500/10" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard icon={<MapPin className="text-blue-400" />} title="Add Track" desc="New racing circuit" onClick={() => setActiveModal('track')} />
            <ActionCard icon={<Calendar className="text-purple-400" />} title="Create Race" desc="Schedule an event" onClick={() => setActiveModal('race')} />
            <ActionCard icon={<Bike className="text-orange-400" />} title="Add Track Bike" desc="For rider rentals" onClick={() => setActiveModal('bike')} />
            <ActionCard icon={<ShieldCheck className="text-green-400" />} title="Add Gear" desc="Safety equipment" onClick={() => setActiveModal('gear')} />
          </div>
        </div>
      )}

      {/* ─── RACES & TRACKS TAB ──── */}
      {activeTab === 'races' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Tracks ({tracks.length})</h2>
            <button onClick={() => setActiveModal('track')} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer flex items-center gap-1"><Plus className="w-4 h-4" /> Add Track</button>
          </div>
          {tracks.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4">
              {tracks.map(t => (
                <div key={t._id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-gray-400 text-sm flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5 text-red-400" />{t.location}</p>
                  {t.length && <p className="text-gray-500 text-xs mt-1">{t.length}</p>}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center pt-4">
            <h2 className="text-xl font-bold text-white">Races ({races.length})</h2>
            <button onClick={() => setActiveModal('race')} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer flex items-center gap-1"><Plus className="w-4 h-4" /> Create Race</button>
          </div>
          {races.length > 0 && (
            <div className="overflow-x-auto glass-panel rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-400 border-b border-slate-700"><tr>
                  <th className="py-3 px-4">Title</th><th className="py-3 px-4">Track</th><th className="py-3 px-4">Date</th><th className="py-3 px-4">Time</th><th className="py-3 px-4">CC Range</th><th className="py-3 px-4">Fee</th><th className="py-3 px-4">Status/Action</th>
                </tr></thead>
                <tbody>{races.map(r => (
                  <tr key={r._id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-white font-medium">{r.title}</td>
                    <td className="py-3 px-4 text-gray-300">{r.track?.name || '—'}</td>
                    <td className="py-3 px-4 text-gray-300">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-300">{r.time}</td>
                    <td className="py-3 px-4 text-gray-300">{r.categoryRange?.minCC}–{r.categoryRange?.maxCC}cc</td>
                    <td className="py-3 px-4 text-orange-400 font-bold">₹{r.fee}</td>
                    <td className="py-3 px-4">
                      {r.status === 'completed' ? (
                        <span className="text-green-400 font-bold text-xs bg-green-400/10 px-2 py-1 rounded">✅ Completed</span>
                      ) : (
                        <button onClick={() => handleSimulateRace(r._id)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer animate-pulse focus:animate-none shadow-lg shadow-orange-500/20">🚀 Simulate Race Demo</button>
                      )}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── BIKES & GEAR TAB ──── */}
      {activeTab === 'bikes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Bike className="text-orange-400" /> Track Bikes ({bikes.length})</h2>
            <button onClick={() => setActiveModal('bike')} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer flex items-center gap-1"><Plus className="w-4 h-4" /> Add Bike</button>
          </div>
          {bikes.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bikes.map(b => (
                <div key={b._id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{b.name}</p>
                    <p className="text-gray-400 text-sm">{b.cc}cc · <span className="text-orange-400 font-bold">₹{b.rentalPrice}/race</span></p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${b.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {b.isAvailable ? 'Available' : 'In Use'}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteBike(b._id)} className="text-red-400 hover:text-red-300 cursor-pointer p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><ShieldCheck className="text-green-400" /> Gear Items ({gearItems.length})</h2>
            <button onClick={() => setActiveModal('gear')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer flex items-center gap-1"><Plus className="w-4 h-4" /> Add Gear</button>
          </div>
          {gearItems.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gearItems.map(g => (
                <div key={g._id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <p className="text-white font-semibold">{g.name}</p>
                  <p className="text-gray-400 text-sm capitalize">{g.type} · <span className="text-orange-400 font-bold">₹{g.rentalPrice}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── BOOKINGS TAB ──── */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">All Bookings ({allBookings.length})</h2>
          {allBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8 glass-panel rounded-xl">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto glass-panel rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-400 border-b border-slate-700"><tr>
                  <th className="py-3 px-4">Rider</th><th className="py-3 px-4">Race</th><th className="py-3 px-4">Date</th><th className="py-3 px-4">Bike</th><th className="py-3 px-4">Gear</th><th className="py-3 px-4">Total</th><th className="py-3 px-4">Status</th>
                </tr></thead>
                <tbody>{allBookings.map(b => (
                  <tr key={b._id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-white font-medium">{b.user?.name || '—'}</td>
                    <td className="py-3 px-4 text-gray-300">{b.race?.title || '—'}</td>
                    <td className="py-3 px-4 text-gray-300">{b.race?.date ? new Date(b.race.date).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-4 text-gray-300">{b.bikeChoice === 'own' ? `Own (${b.ownBikeName})` : b.trackBike?.name || 'Track'}</td>
                    <td className="py-3 px-4 text-gray-300">{b.gearChoice === 'own' ? 'Own' : `Rented (${b.rentedGear?.length || 0})`}</td>
                    <td className="py-3 px-4 text-orange-400 font-bold">₹{b.totalAmount}</td>
                    <td className="py-3 px-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${b.paymentStatus === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{b.paymentStatus}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── MODALS ──── */}
      {activeModal === 'track' && <Modal title="Add New Track" onClose={() => setActiveModal(null)}><AddTrackForm onDone={() => { setActiveModal(null); fetchAll(); }} /></Modal>}
      {activeModal === 'race' && <Modal title="Create Race Event" onClose={() => setActiveModal(null)}><AddRaceForm tracks={tracks} onDone={() => { setActiveModal(null); fetchAll(); }} /></Modal>}
      {activeModal === 'bike' && <Modal title="Add Track Bike" onClose={() => setActiveModal(null)}><AddBikeForm onDone={() => { setActiveModal(null); fetchAll(); }} /></Modal>}
      {activeModal === 'gear' && <Modal title="Add Gear Item" onClose={() => setActiveModal(null)}><AddGearForm onDone={() => { setActiveModal(null); fetchAll(); }} /></Modal>}
    </div>
  );
};

/* ============ Sub-Components ============ */
const StatCard = ({ icon, title, value, bg }) => (
  <div className={`p-5 rounded-2xl border border-slate-700 ${bg}`}><div className="mb-3">{icon}</div><div className="text-3xl font-bold text-white mb-1">{value}</div><div className="text-sm font-medium text-gray-400">{title}</div></div>
);
const ActionCard = ({ icon, title, desc, onClick }) => (
  <button onClick={onClick} className="glass-panel p-5 rounded-xl hover:border-orange-500/50 transition-colors text-left flex items-center gap-4 cursor-pointer group w-full">
    <div className="p-3 bg-slate-800/50 rounded-full group-hover:bg-slate-700 transition-colors">{icon}</div>
    <div><p className="text-white font-bold">{title}</p><p className="text-gray-400 text-xs">{desc}</p></div>
  </button>
);
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="glass-panel rounded-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer text-2xl leading-none">&times;</button></div>
      {children}
    </div>
  </div>
);
const Input = ({ label, type = 'text', value, onChange, placeholder }) => (
  <div><label className="block text-sm font-medium text-gray-400 mb-1">{label}</label><input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" /></div>
);
const SubmitBtn = ({ submitting, text }) => (
  <button type="submit" disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2">
    {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : text}
  </button>
);

/* ── FORMS ── */
const AddTrackForm = ({ onDone }) => {
  const [f, set] = useState({ name: '', location: '', description: '', length: '' });
  const [s, ss] = useState(false);
  const submit = async (e) => { e.preventDefault(); if(!f.name||!f.location||!f.description) return toast.error('Fill required fields'); ss(true); try { await createTrack(f); toast.success('Track added!'); onDone(); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } finally { ss(false); } };
  return <form onSubmit={submit} className="space-y-4"><Input label="Track Name *" value={f.name} onChange={v=>set({...f,name:v})} placeholder="Buddh International Circuit" /><Input label="Location *" value={f.location} onChange={v=>set({...f,location:v})} placeholder="Greater Noida, UP" /><Input label="Description *" value={f.description} onChange={v=>set({...f,description:v})} placeholder="FIA Grade 1 circuit" /><Input label="Track Length" value={f.length} onChange={v=>set({...f,length:v})} placeholder="5.14 km" /><SubmitBtn submitting={s} text="Add Track" /></form>;
};

const AddRaceForm = ({ tracks, onDone }) => {
  const [f, set] = useState({ title:'', track:'', date:'', time:'', fee:'', totalSlots:10, minCC:'', maxCC:'' });
  const [s, ss] = useState(false);
  const submit = async (e) => { e.preventDefault(); if(!f.title||!f.track||!f.date||!f.time||!f.fee) return toast.error('Fill required fields'); ss(true); try { await createRace({ title:f.title, track:f.track, date:f.date, time:f.time, fee:Number(f.fee), totalSlots:Number(f.totalSlots), availableSlots:Number(f.totalSlots), categoryRange:{minCC:Number(f.minCC)||0, maxCC:Number(f.maxCC)||0} }); toast.success('Race created!'); onDone(); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } finally { ss(false); } };
  return <form onSubmit={submit} className="space-y-4"><Input label="Race Title *" value={f.title} onChange={v=>set({...f,title:v})} placeholder="MAD MAX Sprint" />
    <div><label className="block text-sm font-medium text-gray-400 mb-1">Track *</label><select value={f.track} onChange={e=>set({...f,track:e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"><option value="">Select track</option>{tracks.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
    <div className="grid grid-cols-2 gap-4"><Input label="Date *" type="date" value={f.date} onChange={v=>set({...f,date:v})} /><Input label="Time *" value={f.time} onChange={v=>set({...f,time:v})} placeholder="10:00 AM" /></div>
    <div className="grid grid-cols-3 gap-4"><Input label="Fee (₹) *" type="number" value={f.fee} onChange={v=>set({...f,fee:v})} placeholder="5000" /><Input label="Slots" type="number" value={f.totalSlots} onChange={v=>set({...f,totalSlots:v})} /><Input label="Min CC" type="number" value={f.minCC} onChange={v=>set({...f,minCC:v})} placeholder="150" /></div>
    <Input label="Max CC" type="number" value={f.maxCC} onChange={v=>set({...f,maxCC:v})} placeholder="600" />
    <SubmitBtn submitting={s} text="Create Race" /></form>;
};

const AddBikeForm = ({ onDone }) => {
  const [f, set] = useState({ name:'', cc:'', rentalPrice:'' });
  const [s, ss] = useState(false);
  const submit = async (e) => { e.preventDefault(); if(!f.name||!f.cc||!f.rentalPrice) return toast.error('Fill all fields'); ss(true); try { await createBike({ name:f.name, cc:Number(f.cc), type:'track', rentalPrice:Number(f.rentalPrice), isAvailable:true }); toast.success('Bike added!'); onDone(); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } finally { ss(false); } };
  return <form onSubmit={submit} className="space-y-4"><Input label="Bike Name *" value={f.name} onChange={v=>set({...f,name:v})} placeholder="Yamaha R15 V4" /><div className="grid grid-cols-2 gap-4"><Input label="Engine CC *" type="number" value={f.cc} onChange={v=>set({...f,cc:v})} placeholder="155" /><Input label="Rental Price (₹) *" type="number" value={f.rentalPrice} onChange={v=>set({...f,rentalPrice:v})} placeholder="1500" /></div><SubmitBtn submitting={s} text="Add Bike" /></form>;
};

const AddGearForm = ({ onDone }) => {
  const [f, set] = useState({ name:'', type:'helmet', rentalPrice:'' });
  const [s, ss] = useState(false);
  const submit = async (e) => { e.preventDefault(); if(!f.name||!f.rentalPrice) return toast.error('Fill all fields'); ss(true); try { await createGearItem({ name:f.name, type:f.type, rentalPrice:Number(f.rentalPrice), isAvailable:true }); toast.success('Gear added!'); onDone(); } catch(err) { toast.error(err.response?.data?.message||'Failed'); } finally { ss(false); } };
  return <form onSubmit={submit} className="space-y-4"><Input label="Gear Name *" value={f.name} onChange={v=>set({...f,name:v})} placeholder="Racing Helmet (HJC)" />
    <div><label className="block text-sm font-medium text-gray-400 mb-1">Type *</label><select value={f.type} onChange={e=>set({...f,type:e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"><option value="helmet">Helmet</option><option value="gloves">Gloves</option><option value="suit">Suit</option><option value="boots">Boots</option><option value="full-kit">Full Kit</option></select></div>
    <Input label="Rental Price (₹) *" type="number" value={f.rentalPrice} onChange={v=>set({...f,rentalPrice:v})} placeholder="500" />
    <SubmitBtn submitting={s} text="Add Gear" /></form>;
};

export default AdminDashboard;
