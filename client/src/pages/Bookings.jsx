import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Search, Loader2, CheckCircle, ArrowLeft, ArrowRight, Bike, ShieldCheck, CreditCard, Lock, Smartphone, Building2, CircleCheck, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getRaces, getBikes, getGear, createBooking, getMyBookings } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Select Race', 'Choose Bike', 'Choose Gear', 'Payment', 'Confirmation'];

const Bookings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [races, setRaces] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [gearItems, setGearItems] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Booking flow state
  const [step, setStep] = useState(0);
  const [selectedRace, setSelectedRace] = useState(null);
  const [bikeChoice, setBikeChoice] = useState('own');
  const [ownBikeName, setOwnBikeName] = useState('');
  const [ownBikeCC, setOwnBikeCC] = useState('');
  const [selectedTrackBike, setSelectedTrackBike] = useState(null);
  const [gearChoice, setGearChoice] = useState('own');
  const [selectedGear, setSelectedGear] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'netbanking'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [racesRes, bikesRes, gearRes, bookingsRes] = await Promise.all([
        getRaces(), getBikes(), getGear(), getMyBookings()
      ]);
      setRaces(racesRes.data.data);
      setBikes(bikesRes.data.data);
      setGearItems(gearRes.data.data);
      setMyBookings(bookingsRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetFlow = () => {
    setStep(0); setSelectedRace(null); setBikeChoice('own'); setOwnBikeName(''); setOwnBikeCC('');
    setSelectedTrackBike(null); setGearChoice('own'); setSelectedGear([]); setActiveTab('available');
    setPaymentMethod('card'); setCardNumber(''); setCardExpiry(''); setCardCVV(''); setCardName('');
    setUpiId(''); setPaymentProcessing(false); setPaymentSuccess(false); setTxnId('');
  };

  const startBooking = (race) => {
    const alreadyBooked = myBookings.find((b) => b.race?._id === race._id);
    if (alreadyBooked) return toast.warn('You already booked this race!');
    if (race.availableSlots < 1) return toast.error('No slots left!');
    setSelectedRace(race); setStep(1);
  };

  const calcTotal = () => {
    let total = selectedRace?.fee || 0;
    if (bikeChoice === 'track' && selectedTrackBike) total += selectedTrackBike.rentalPrice;
    if (gearChoice === 'rent' && selectedGear.length > 0) total += selectedGear.reduce((s, g) => s + g.rentalPrice, 0);
    return total;
  };

  // Format card number with spaces
  const formatCardNumber = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Format expiry
  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    return cleaned;
  };

  // Validate payment details
  const validatePayment = () => {
    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16) { toast.error('Enter a valid 16-digit card number'); return false; }
      if (cardExpiry.length < 5) { toast.error('Enter a valid expiry date (MM/YY)'); return false; }
      if (cardCVV.length < 3) { toast.error('Enter a valid CVV'); return false; }
      if (!cardName.trim()) { toast.error('Enter the cardholder name'); return false; }
    } else if (paymentMethod === 'upi') {
      if (!upiId.includes('@')) { toast.error('Enter a valid UPI ID (e.g., name@upi)'); return false; }
    }
    return true;
  };

  // Process payment (simulated)
  const processPayment = async () => {
    if (!validatePayment()) return;

    setPaymentProcessing(true);

    // Simulate payment gateway processing with delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // SIMULATED FAILURE CONDITION FOR DEMO PURPOSES
    if (paymentMethod === 'card' && cardCVV === '000') {
      setPaymentProcessing(false);
      setStep(6);
      return;
    }

    try {
      const res = await createBooking({
        race: selectedRace._id,
        bikeChoice,
        ownBikeName: bikeChoice === 'own' ? ownBikeName : undefined,
        ownBikeCC: bikeChoice === 'own' ? Number(ownBikeCC) : undefined,
        trackBike: bikeChoice === 'track' ? selectedTrackBike._id : undefined,
        gearChoice,
        rentedGear: gearChoice === 'rent' ? selectedGear.map(g => g._id) : [],
        paymentMethod,
        cardLast4: paymentMethod === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : undefined,
      });

      setTxnId(res.data.transactionId || 'TXN_GENERATED');
      setPaymentSuccess(true);
      setStep(5);
      fetchData();
      toast.success('🏁 Payment successful! Confirmation email sent.');
    } catch (err) {
      setStep(6);
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const toggleGearItem = (item) => {
    setSelectedGear(prev => prev.find(g => g._id === item._id) ? prev.filter(g => g._id !== item._id) : [...prev, item]);
  };

  const filteredRaces = races.filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase()) || r.track?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const bookedRaceIds = myBookings.map((b) => b.race?._id);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 text-orange-500 animate-spin" /></div>;

  // ─── PAYMENT SUCCESS SCREEN ────
  if (step === 5 && paymentSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CircleCheck className="w-12 h-12 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">Payment Successful!</h2>
        <p className="text-gray-400">Your race has been booked. A confirmation email has been sent to <span className="text-orange-400 font-semibold">{user?.email}</span>.</p>
        <div className="glass-panel p-4 rounded-xl inline-block">
          <p className="text-gray-400 text-sm">Transaction ID</p>
          <p className="text-white font-mono font-bold text-lg">{txnId}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl text-left space-y-3 mt-4">
          <div className="flex justify-between"><span className="text-gray-400">Race</span><span className="text-white font-semibold">{selectedRace?.title}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Track</span><span className="text-white">{selectedRace?.track?.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="text-white">{new Date(selectedRace?.date).toLocaleDateString()} · {selectedRace?.time}</span></div>
          <div className="flex justify-between border-t border-slate-700 pt-3"><span className="text-white font-bold">Amount Paid</span><span className="text-green-400 font-bold text-xl">₹{calcTotal()}</span></div>
        </div>
        <div className="flex gap-4 justify-center pt-4">
          <button onClick={() => { resetFlow(); setActiveTab('my'); }} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer">View My Bookings</button>
          <button onClick={resetFlow} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer">Book Another Race</button>
        </div>
      </div>
    );
  }

  // ─── PAYMENT FAILED SCREEN ────
  if (step === 6) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-white">Payment Failed</h2>
        <p className="text-gray-400">Unfortunately, your payment could not be processed. Please check your payment details and try again.</p>
        <div className="flex gap-4 justify-center pt-4">
          <button onClick={() => setStep(4)} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors">Try Again</button>
          <button onClick={resetFlow} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors">Cancel Booking</button>
        </div>
      </div>
    );
  }

  // ─── BOOKING FLOW (Steps 1-4) ────
  if (step > 0 && selectedRace) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-2 flex-wrap">
          {STEPS.slice(0, 4).map((label, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${step > i + 1 ? 'bg-green-500 border-green-500 text-white' : step === i + 1 ? 'border-orange-500 text-orange-500' : 'border-slate-600 text-slate-600'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`hidden md:block text-xs mr-2 ${step === i + 1 ? 'text-orange-400 font-semibold' : 'text-gray-500'}`}>{label}</span>
              {i < 3 && <div className={`hidden md:block w-8 h-0.5 mr-2 ${step > i + 1 ? 'bg-green-500' : 'bg-slate-700'}`}></div>}
            </div>
          ))}
        </div>

        {/* Race summary bar */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between text-sm">
          <div>
            <p className="text-white font-bold">{selectedRace.title}</p>
            <p className="text-gray-400">{selectedRace.track?.name} · {new Date(selectedRace.date).toLocaleDateString()} · {selectedRace.time}</p>
          </div>
          <p className="text-orange-400 font-bold">₹{calcTotal()}</p>
        </div>

        {/* ─── STEP 1: BIKE ──── */}
        {step === 1 && (
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Bike className="text-orange-400" /> Choose Your Bike</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setBikeChoice('own')} className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${bikeChoice === 'own' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                <p className="text-white font-bold text-lg mb-1">🏍️ Own Bike</p><p className="text-gray-400 text-sm">Bring your own machine</p><p className="text-green-400 text-xs mt-2 font-medium">No extra charges</p>
              </button>
              <button onClick={() => setBikeChoice('track')} className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${bikeChoice === 'track' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                <p className="text-white font-bold text-lg mb-1">🏟️ Track Bike</p><p className="text-gray-400 text-sm">Rent a high-performance bike</p><p className="text-orange-400 text-xs mt-2 font-medium">Rental fee applies</p>
              </button>
            </div>
            {bikeChoice === 'own' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Bike Name</label>
                  <input type="text" value={ownBikeName} onChange={e => setOwnBikeName(e.target.value)} placeholder="e.g., Kawasaki Ninja 300" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500" /></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Engine CC</label>
                  <input type="number" value={ownBikeCC} onChange={e => setOwnBikeCC(e.target.value)} placeholder="e.g., 300" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500" /></div>
              </div>
            )}
            {bikeChoice === 'track' && (
              <div className="space-y-3 pt-2">
                <p className="text-gray-400 text-sm">Available Track Bikes:</p>
                <div className="grid gap-3 max-h-72 overflow-y-auto pr-2">
                  {bikes.filter(b => b.isAvailable).map(bike => (
                    <button key={bike._id} onClick={() => setSelectedTrackBike(bike)}
                      className={`p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all cursor-pointer ${selectedTrackBike?._id === bike._id ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                      <div><p className="text-white font-semibold">{bike.name}</p><p className="text-gray-400 text-sm">{bike.cc}cc</p></div>
                      <div className="text-right"><p className="text-orange-400 font-bold">₹{bike.rentalPrice}</p><p className="text-gray-500 text-xs">per race</p></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 2: GEAR ──── */}
        {step === 2 && (
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><ShieldCheck className="text-orange-400" /> Safety Gear</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setGearChoice('own'); setSelectedGear([]); }} className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${gearChoice === 'own' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                <p className="text-white font-bold text-lg mb-1">🧤 Own Gear</p><p className="text-gray-400 text-sm">Bring your own equipment</p><p className="text-green-400 text-xs mt-2 font-medium">No extra charges</p>
              </button>
              <button onClick={() => setGearChoice('rent')} className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${gearChoice === 'rent' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                <p className="text-white font-bold text-lg mb-1">🛡️ Rent Gear</p><p className="text-gray-400 text-sm">Premium gear inventory</p><p className="text-orange-400 text-xs mt-2 font-medium">Rental fee applies</p>
              </button>
            </div>
            {gearChoice === 'rent' && (
              <div className="space-y-3 pt-2">
                <p className="text-gray-400 text-sm">Select gear items:</p>
                <div className="grid gap-3">
                  {gearItems.filter(g => g.isAvailable).map(item => {
                    const isSelected = selectedGear.find(g => g._id === item._id);
                    return (
                      <button key={item._id} onClick={() => toggleGearItem(item)}
                        className={`p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all cursor-pointer ${isSelected ? 'border-green-500 bg-green-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                        <div className="flex items-center gap-3">
                          {isSelected && <CheckCircle className="w-5 h-5 text-green-400" />}
                          <div><p className="text-white font-semibold">{item.name}</p><p className="text-gray-400 text-xs capitalize">{item.type}</p></div>
                        </div>
                        <p className="text-orange-400 font-bold">₹{item.rentalPrice}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 3: ORDER REVIEW ──── */}
        {step === 3 && (
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><CreditCard className="text-orange-400" /> Order Summary</h2>
            <div className="space-y-3">
              <Row label="Race" value={selectedRace.title} />
              <Row label="Track" value={selectedRace.track?.name} />
              <Row label="Date & Time" value={`${new Date(selectedRace.date).toLocaleDateString()} · ${selectedRace.time}`} />
              <Row label="Bike" value={bikeChoice === 'own' ? `${ownBikeName} (${ownBikeCC}cc) — Own` : `${selectedTrackBike?.name} — Rented`} />
              <Row label="Gear" value={gearChoice === 'own' ? 'Own Gear' : selectedGear.map(g => g.name).join(', ') || 'None'} />
            </div>
            <div className="border-t border-slate-700 pt-4 space-y-2 mt-4">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Track Fee</span><span className="text-white">₹{selectedRace.fee}</span></div>
              {bikeChoice === 'track' && selectedTrackBike && <div className="flex justify-between text-sm"><span className="text-gray-400">Bike Rental</span><span className="text-white">₹{selectedTrackBike.rentalPrice}</span></div>}
              {gearChoice === 'rent' && selectedGear.length > 0 && <div className="flex justify-between text-sm"><span className="text-gray-400">Gear Rental ({selectedGear.length} items)</span><span className="text-white">₹{selectedGear.reduce((s,g) => s + g.rentalPrice, 0)}</span></div>}
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-slate-700"><span className="text-white">Total</span><span className="text-orange-400">₹{calcTotal()}</span></div>
            </div>
          </div>
        )}

        {/* ─── STEP 4: PAYMENT ──── */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Payment processing overlay */}
            {paymentProcessing && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="glass-panel p-10 rounded-3xl text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-white font-bold text-lg">Processing Payment...</p>
                  <p className="text-gray-400 text-sm">Please do not close this window</p>
                  <p className="text-orange-400 font-bold text-2xl">₹{calcTotal()}</p>
                </div>
              </div>
            )}

            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Lock className="text-green-400 w-5 h-5" /> Secure Payment</h2>
                <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full font-medium flex items-center gap-1"><Lock className="w-3 h-3" /> 256-bit SSL</span>
              </div>

              {/* Amount summary */}
              <div className="bg-slate-800/60 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Amount to Pay</p>
                  <p className="text-3xl font-bold text-orange-400">₹{calcTotal()}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{selectedRace.title}</p>
                  <p className="text-gray-400 text-xs">{selectedRace.track?.name}</p>
                </div>
              </div>

              {/* Payment method tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                  <CreditCard className={`w-6 h-6 mx-auto mb-1 ${paymentMethod === 'card' ? 'text-orange-400' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${paymentMethod === 'card' ? 'text-orange-400' : 'text-gray-400'}`}>Card</p>
                </button>
                <button onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                  <Smartphone className={`w-6 h-6 mx-auto mb-1 ${paymentMethod === 'upi' ? 'text-orange-400' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${paymentMethod === 'upi' ? 'text-orange-400' : 'text-gray-400'}`}>UPI</p>
                </button>
                <button onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${paymentMethod === 'netbanking' ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                  <Building2 className={`w-6 h-6 mx-auto mb-1 ${paymentMethod === 'netbanking' ? 'text-orange-400' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${paymentMethod === 'netbanking' ? 'text-orange-400' : 'text-gray-400'}`}>Net Banking</p>
                </button>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Card Number</label>
                    <div className="relative">
                      <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456" maxLength={19}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white tracking-widest text-lg font-mono focus:outline-none focus:border-orange-500" />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Cardholder Name</label>
                    <input type="text" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                      placeholder="JOHN DOE" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white uppercase tracking-wider focus:outline-none focus:border-orange-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Expiry</label>
                      <input type="text" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY" maxLength={5} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white text-center font-mono focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">CVV</label>
                      <input type="password" value={cardCVV} onChange={e => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••" maxLength={4} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white text-center font-mono focus:outline-none focus:border-orange-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">UPI ID</label>
                    <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {['@ybl', '@paytm', '@oksbi', '@okaxis'].map(suffix => (
                      <button key={suffix} onClick={() => setUpiId(prev => prev.split('@')[0] + suffix)}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 text-sm hover:border-orange-500 cursor-pointer">
                        {suffix}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Net Banking */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">Select your bank:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(bank => (
                      <button key={bank} className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm hover:border-orange-500 cursor-pointer text-left">
                        🏦 {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-gray-500 text-xs text-center">
                🔒 This is a simulated payment gateway. <strong>Tip:</strong> Enter CVV <code>000</code> to test payment failure.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-2">
          <button onClick={() => step === 1 ? resetFlow() : setStep(step - 1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer px-4 py-2">
            <ArrowLeft className="w-4 h-4" /> {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button onClick={() => {
              if (step === 1 && bikeChoice === 'own' && (!ownBikeName || !ownBikeCC)) return toast.error('Enter your bike details');
              if (step === 1 && bikeChoice === 'track' && !selectedTrackBike) return toast.error('Select a track bike');
              setStep(step + 1);
            }} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all cursor-pointer">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === 3 ? (
            <button onClick={() => setStep(4)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all cursor-pointer">
              Proceed to Payment <CreditCard className="w-4 h-4" />
            </button>
          ) : step === 4 ? (
            <button onClick={processPayment} disabled={paymentProcessing}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold transition-all cursor-pointer">
              {paymentProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <>💳 Pay ₹{calcTotal()}</>}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // ─── MAIN VIEW ────
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Race Booking</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search races or tracks..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-white focus:outline-none focus:border-orange-500 w-full md:w-72" />
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-700 pb-2">
        <button className={`pb-2 font-medium transition-colors border-b-2 cursor-pointer ${activeTab === 'available' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-white'}`} onClick={() => setActiveTab('available')}>Available Races ({filteredRaces.length})</button>
        <button className={`pb-2 font-medium transition-colors border-b-2 cursor-pointer ${activeTab === 'my' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-white'}`} onClick={() => setActiveTab('my')}>My Bookings ({myBookings.length})</button>
      </div>

      {activeTab === 'available' && (
        filteredRaces.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl"><p className="text-gray-400 text-lg">No races available right now.</p><p className="text-gray-500 text-sm mt-2">Check back later!</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRaces.map((race) => {
              const isBooked = bookedRaceIds.includes(race._id);
              const soldOut = race.availableSlots < 1;
              return (
                <div key={race._id} className="glass-panel rounded-2xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-end p-5">
                    <div className="absolute top-3 right-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${race.availableSlots > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{race.availableSlots}/{race.totalSlots} slots</span></div>
                    <div>
                      {race.categoryRange && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">{race.categoryRange.minCC}–{race.categoryRange.maxCC}CC</span>}
                      <h3 className="text-xl font-bold text-white mt-2 leading-tight">{race.title}</h3>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center text-sm text-gray-300">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-orange-400" />{new Date(race.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-400" />{race.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-400"><MapPin className="w-4 h-4 text-red-400" />{race.track?.name || 'TBA'} — {race.track?.location || ''}</div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                      <div className="font-bold text-xl text-white">₹{race.fee} <span className="text-sm font-normal text-gray-500">+ extras</span></div>
                      {isBooked ? (
                        <span className="flex items-center gap-1.5 text-green-400 font-semibold text-sm"><CheckCircle className="w-4 h-4" /> Booked</span>
                      ) : (
                        <button onClick={() => startBooking(race)} disabled={soldOut} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-bold transition-all cursor-pointer">{soldOut ? 'SOLD OUT' : 'Book Now →'}</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {activeTab === 'my' && (
        myBookings.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl"><p className="text-gray-400 text-lg">No bookings yet.</p>
            <button onClick={() => setActiveTab('available')} className="text-orange-400 hover:text-orange-300 font-medium underline mt-2 cursor-pointer">Browse races →</button></div>
        ) : (
          <div className="space-y-4">
            {myBookings.map((b) => (
              <div key={b._id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-white font-bold text-lg">{b.race?.title || 'Race'}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-orange-400" />{b.race?.date ? new Date(b.race.date).toLocaleDateString() : 'N/A'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-400" />{b.race?.time || 'N/A'}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-400" />{b.race?.track?.name || 'Track'}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Bike: {b.bikeChoice === 'own' ? `${b.ownBikeName} (${b.ownBikeCC}cc)` : b.trackBike?.name} · Gear: {b.gearChoice === 'own' ? 'Own' : `Rented (${b.rentedGear?.length})`} · TXN: {b.transactionId}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-orange-400 font-bold text-lg">₹{b.totalAmount}</p>
                    <p className="text-gray-500 text-xs">₹{b.trackFee} + ₹{b.bikeRentFee} + ₹{b.gearRentFee}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${b.paymentStatus === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{b.paymentStatus?.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
    <span className="text-gray-400">{label}</span><span className="text-white font-semibold text-right">{value}</span>
  </div>
);

export default Bookings;
