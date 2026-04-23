import { ArrowRight, Trophy, Zap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative h-[75vh] flex items-center justify-center overflow-hidden rounded-3xl mt-8">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        ></div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-[#0f172a]/40 z-10"></div>
        {/* Side glow effects */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500 rounded-full blur-[150px] opacity-15 z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-red-600 rounded-full blur-[150px] opacity-15 z-10"></div>

        <div className="relative z-20 text-center space-y-6 px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase mb-4 drop-shadow-lg">
            Race. Conquer. <span className="gradient-text drop-shadow-2xl">Repeat.</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            India's ultimate bike racing platform — pick your track, choose your machine, gear up, and hit the asphalt with riders who live for speed.
          </p>
          <div className="pt-8">
            <Link
              to={isAuthenticated ? "/bookings" : "/register"}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_25px_rgba(249,115,22,0.5)] transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
            >
              BOOK A RACE <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 pb-12">
        <FeatureCard
          icon={<Zap className="w-10 h-10 text-yellow-400" />}
          title="Instant Booking"
          desc="Browse races from 150cc to 1000cc. Rent track bikes and safety gear with transparent pricing — no hidden fees."
        />
        <FeatureCard
          icon={<Trophy className="w-10 h-10 text-orange-400" />}
          title="Pro Tracking"
          desc="Lap timings, penalty tracking, qualification results — all recorded and visible from your rider dashboard."
        />
        <FeatureCard
          icon={<MapPin className="w-10 h-10 text-red-400" />}
          title="Top Circuits"
          desc="Buddh International, Madras Motor, Kari Speedway — race at India's most iconic tracks."
        />
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group cursor-default">
    <div className="mb-4 p-4 bg-slate-800/50 rounded-full w-fit group-hover:bg-slate-800 transition-colors">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default Home;
