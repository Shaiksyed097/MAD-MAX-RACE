import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Tracks
export const getTracks = () => API.get('/tracks');
export const createTrack = (data) => API.post('/tracks', data);

// Races
export const getRaces = () => API.get('/races');
export const createRace = (data) => API.post('/races', data);

// Bikes
export const getBikes = () => API.get('/bikes');
export const createBike = (data) => API.post('/bikes', data);
export const deleteBike = (id) => API.delete(`/bikes/${id}`);

// Gear
export const getGear = () => API.get('/gear');
export const createGearItem = (data) => API.post('/gear', data);

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const getAllBookings = () => API.get('/bookings');

// Results & Leaderboard
export const getLeaderboard = () => API.get('/results/leaderboard');
export const getMyResults = () => API.get('/results/my');
export const getRaceResults = (raceId) => API.get(`/results/race/${raceId}`);
export const publishResults = (data) => API.post('/results/publish', data);

// Admin Dashboard
export const getAdminStats = () => API.get('/dashboard/admin');

export default API;
