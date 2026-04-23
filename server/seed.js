/**
 * Database Seed Script
 * Run: node seed.js
 * Creates: Admin, sample riders with XP, tracks, bikes, gear, races, and results
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Track = require('./models/Track');
const Bike = require('./models/Bike');
const Gear = require('./models/Gear');
const Race = require('./models/Race');
const Booking = require('./models/Booking');
const RaceResult = require('./models/RaceResult');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear all data
    await User.deleteMany({});
    await Track.deleteMany({});
    await Bike.deleteMany({});
    await Gear.deleteMany({});
    await Race.deleteMany({});
    await Booking.deleteMany({});
    await RaceResult.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Admin
    const admin = await User.create({
      name: 'Race Admin',
      email: 'admin@madmax.com',
      password: 'admin123',
      role: 'admin',
      age: 30,
      isApproved: true
    });
    console.log('Admin created: admin@madmax.com / admin123');

    // 2. Sample Riders with XP/Stats
    const riders = await Promise.all([
      User.create({ name: 'Leo Rossi', email: 'leo@madmax.com', password: 'rider123', role: 'rider', age: 22, xp: 3200, level: 4, rank: 'Pro', wins: 2, podiums: 5, totalRaces: 8, bestLapTime: '1:42.350' }),
      User.create({ name: 'Arjun Verma', email: 'arjun@madmax.com', password: 'rider123', role: 'rider', age: 25, xp: 5500, level: 5, rank: 'Expert', wins: 4, podiums: 7, totalRaces: 12, bestLapTime: '1:38.920' }),
      User.create({ name: 'Priya Sharma', email: 'priya@madmax.com', password: 'rider123', role: 'rider', age: 23, xp: 2100, level: 3, rank: 'Semi-Pro', wins: 1, podiums: 3, totalRaces: 6, bestLapTime: '1:45.100' }),
      User.create({ name: 'Vikram Raj', email: 'vikram@madmax.com', password: 'rider123', role: 'rider', age: 28, xp: 8500, level: 6, rank: 'Elite', wins: 6, podiums: 10, totalRaces: 15, bestLapTime: '1:36.780' }),
      User.create({ name: 'Rahul Kumar', email: 'rahul@madmax.com', password: 'rider123', role: 'rider', age: 21, xp: 900, level: 2, rank: 'Amateur', wins: 0, podiums: 1, totalRaces: 4, bestLapTime: '1:48.500' }),
      User.create({ name: 'Deepak Singh', email: 'deepak@madmax.com', password: 'rider123', role: 'rider', age: 27, xp: 12500, level: 7, rank: 'Champion', wins: 8, podiums: 14, totalRaces: 20, bestLapTime: '1:35.200' }),
      User.create({ name: 'Kavya Nair', email: 'kavya@madmax.com', password: 'rider123', role: 'rider', age: 24, xp: 1600, level: 3, rank: 'Semi-Pro', wins: 1, podiums: 2, totalRaces: 5, bestLapTime: '1:46.300' }),
      User.create({ name: 'Rohan Iyer', email: 'rohan@madmax.com', password: 'rider123', role: 'rider', age: 26, xp: 4200, level: 4, rank: 'Pro', wins: 3, podiums: 6, totalRaces: 10, bestLapTime: '1:40.150' }),
    ]);
    console.log(`${riders.length} sample riders created.`);

    // 3. Tracks
    const tracks = await Track.insertMany([
      { name: 'Buddh International Circuit', location: 'Greater Noida, UP', coordinates: { lat: 28.3544, lng: 77.5330 }, description: 'FIA Grade 1 circuit, home of the former Indian Grand Prix.', length: '5.14 km' },
      { name: 'Madras International Circuit', location: 'Chennai, Tamil Nadu', coordinates: { lat: 12.7409, lng: 80.1868 }, description: 'India\'s first permanent racing circuit. 3.7 km with 12 turns.', length: '3.71 km' },
      { name: 'Kari Motor Speedway', location: 'Coimbatore, Tamil Nadu', coordinates: { lat: 10.9578, lng: 76.9601 }, description: 'Popular motorsport venue for national championships.', length: '2.2 km' }
    ]);
    console.log(`${tracks.length} tracks created.`);

    // 4. Bikes
    const bikes = await Bike.insertMany([
      { name: 'Yamaha R15 V4', cc: 155, type: 'track', rentalPrice: 1500, isAvailable: true },
      { name: 'KTM RC 200', cc: 200, type: 'track', rentalPrice: 2000, isAvailable: true },
      { name: 'Yamaha R3', cc: 321, type: 'track', rentalPrice: 3000, isAvailable: true },
      { name: 'KTM RC 390', cc: 373, type: 'track', rentalPrice: 3500, isAvailable: true },
      { name: 'Kawasaki Ninja 650', cc: 649, type: 'track', rentalPrice: 5000, isAvailable: true },
      { name: 'Kawasaki ZX-6R', cc: 636, type: 'track', rentalPrice: 7000, isAvailable: true },
      { name: 'Honda CBR 1000RR', cc: 998, type: 'track', rentalPrice: 10000, isAvailable: true },
      { name: 'BMW S1000RR', cc: 999, type: 'track', rentalPrice: 12000, isAvailable: true }
    ]);
    console.log(`${bikes.length} track bikes created.`);

    // 5. Gear
    const gear = await Gear.insertMany([
      { name: 'Racing Helmet (HJC)', type: 'helmet', rentalPrice: 500, isAvailable: true },
      { name: 'Racing Helmet (Shoei)', type: 'helmet', rentalPrice: 800, isAvailable: true },
      { name: 'Racing Gloves', type: 'gloves', rentalPrice: 300, isAvailable: true },
      { name: 'Leather Racing Suit', type: 'suit', rentalPrice: 1200, isAvailable: true },
      { name: 'Racing Boots', type: 'boots', rentalPrice: 600, isAvailable: true },
      { name: 'Full Safety Kit (Helmet + Gloves + Suit + Boots)', type: 'full-kit', rentalPrice: 2000, isAvailable: true }
    ]);
    console.log(`${gear.length} gear items created.`);

    // 6. Races (mix of upcoming and completed)
    const races = await Race.insertMany([
      { title: 'MAD MAX Sprint - Round 1', track: tracks[0]._id, date: new Date('2026-05-15'), time: '10:00 AM', categoryRange: { minCC: 150, maxCC: 400 }, totalSlots: 15, availableSlots: 15, fee: 3000, status: 'upcoming' },
      { title: 'MAD MAX Thunder - 600CC', track: tracks[0]._id, date: new Date('2026-05-20'), time: '2:00 PM', categoryRange: { minCC: 400, maxCC: 700 }, totalSlots: 10, availableSlots: 10, fee: 5000, status: 'upcoming' },
      { title: 'Chennai Street Blitz', track: tracks[1]._id, date: new Date('2026-06-01'), time: '9:00 AM', categoryRange: { minCC: 150, maxCC: 400 }, totalSlots: 20, availableSlots: 20, fee: 2500, status: 'upcoming' },
      { title: 'Superbike Showdown', track: tracks[1]._id, date: new Date('2026-06-10'), time: '11:00 AM', categoryRange: { minCC: 600, maxCC: 1100 }, totalSlots: 8, availableSlots: 8, fee: 8000, status: 'upcoming' },
      { title: 'Kari Rookie Cup', track: tracks[2]._id, date: new Date('2026-06-20'), time: '10:30 AM', categoryRange: { minCC: 150, maxCC: 300 }, totalSlots: 25, availableSlots: 25, fee: 2000, status: 'upcoming' },
      { title: 'MAD MAX Endurance Challenge', track: tracks[2]._id, date: new Date('2026-07-05'), time: '8:00 AM', categoryRange: { minCC: 300, maxCC: 1100 }, totalSlots: 12, availableSlots: 12, fee: 6000, status: 'upcoming' },
      // Completed race for results demo
      { title: 'Buddh Grand Prix - Season Opener', track: tracks[0]._id, date: new Date('2026-04-01'), time: '10:00 AM', categoryRange: { minCC: 150, maxCC: 1100 }, totalSlots: 10, availableSlots: 0, fee: 5000, status: 'completed' },
    ]);
    console.log(`${races.length} races created.`);

    // 7. Sample Race Results for the completed race
    const completedRace = races[6];
    await RaceResult.insertMany([
      { race: completedRace._id, rider: riders[5]._id, position: 1, lapTime: '1:35.200', xpEarned: 1000 },
      { race: completedRace._id, rider: riders[3]._id, position: 2, lapTime: '1:36.780', xpEarned: 700 },
      { race: completedRace._id, rider: riders[1]._id, position: 3, lapTime: '1:38.920', xpEarned: 500 },
      { race: completedRace._id, rider: riders[7]._id, position: 4, lapTime: '1:40.150', xpEarned: 350 },
      { race: completedRace._id, rider: riders[0]._id, position: 5, lapTime: '1:42.350', xpEarned: 250 },
      { race: completedRace._id, rider: riders[2]._id, position: 6, lapTime: '1:45.100', xpEarned: 200 },
      { race: completedRace._id, rider: riders[6]._id, position: 7, lapTime: '1:46.300', xpEarned: 150 },
      { race: completedRace._id, rider: riders[4]._id, position: 8, lapTime: '1:48.500', xpEarned: 100 },
    ]);
    console.log('8 race results created for completed race.');

    console.log('\n✅ Database seeded successfully!');
    console.log('================================');
    console.log('Admin:  admin@madmax.com / admin123');
    console.log('Rider:  leo@madmax.com / rider123');
    console.log('================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDB();
