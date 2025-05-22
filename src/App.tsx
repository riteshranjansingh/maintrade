import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import ProfilesPage from './pages/profiles/ProfilesPage';

// Placeholder components - will be replaced with actual components later
const Dashboard = () => <div className="p-4">Dashboard Page</div>;
const Alerts = () => <div className="p-4">Alerts Page</div>;
const Orders = () => <div className="p-4">Orders Page</div>;
const Positions = () => <div className="p-4">Positions Page</div>;
const Journal = () => <div className="p-4">Journal Page</div>;
const Watchlist = () => <div className="p-4">Watchlist Page</div>;
const Backtest = () => <div className="p-4">Backtest Page</div>;
const Settings = () => <div className="p-4">Settings Page</div>;

// Sidebar navigation component
const Sidebar = () => {
  return (
    <div className="w-64 h-full bg-gray-800 text-white p-4">
      <h1 className="text-xl font-bold mb-6">MainTrade</h1>
      <nav>
        <ul className="space-y-2">
          <li><Link to="/" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</Link></li>
          <li><Link to="/profiles" className="block py-2 px-4 rounded hover:bg-gray-700">Profiles</Link></li>
          <li><Link to="/alerts" className="block py-2 px-4 rounded hover:bg-gray-700">Alerts</Link></li>
          <li><Link to="/orders" className="block py-2 px-4 rounded hover:bg-gray-700">Orders</Link></li>
          <li><Link to="/positions" className="block py-2 px-4 rounded hover:bg-gray-700">Positions</Link></li>
          <li><Link to="/journal" className="block py-2 px-4 rounded hover:bg-gray-700">Journal</Link></li>
          <li><Link to="/watchlist" className="block py-2 px-4 rounded hover:bg-gray-700">Watchlist</Link></li>
          <li><Link to="/backtest" className="block py-2 px-4 rounded hover:bg-gray-700">Backtest</Link></li>
          <li><Link to="/settings" className="block py-2 px-4 rounded hover:bg-gray-700">Settings</Link></li>
        </ul>
      </nav>
    </div>
  );
};

// Main App component
function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow h-16 flex items-center px-6">
          <h2 className="text-lg font-semibold">MainTrade</h2>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/backtest" element={<Backtest />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;