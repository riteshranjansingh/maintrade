import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Placeholder components - will be replaced with actual components later
const Dashboard = () => <div className="p-4">Dashboard Page</div>;
const Profiles = () => <div className="p-4">Profiles Page</div>;
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
          <li><a href="/" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</a></li>
          <li><a href="/profiles" className="block py-2 px-4 rounded hover:bg-gray-700">Profiles</a></li>
          <li><a href="/alerts" className="block py-2 px-4 rounded hover:bg-gray-700">Alerts</a></li>
          <li><a href="/orders" className="block py-2 px-4 rounded hover:bg-gray-700">Orders</a></li>
          <li><a href="/positions" className="block py-2 px-4 rounded hover:bg-gray-700">Positions</a></li>
          <li><a href="/journal" className="block py-2 px-4 rounded hover:bg-gray-700">Journal</a></li>
          <li><a href="/watchlist" className="block py-2 px-4 rounded hover:bg-gray-700">Watchlist</a></li>
          <li><a href="/backtest" className="block py-2 px-4 rounded hover:bg-gray-700">Backtest</a></li>
          <li><a href="/settings" className="block py-2 px-4 rounded hover:bg-gray-700">Settings</a></li>
        </ul>
      </nav>
    </div>
  );
};

// Main App component
function App() {
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    // Example of interacting with Electron main process
    // This assumes the electron API has been exposed in the preload script
    const getVersion = async () => {
      try {
        if (window.electron) {
          const version = await window.electron.getAppVersion();
          setAppVersion(version);
        }
      } catch (error) {
        console.error('Failed to get app version', error);
      }
    };

    getVersion();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow h-16 flex items-center px-6">
          <h2 className="text-lg font-semibold">MainTrade {appVersion && `v${appVersion}`}</h2>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profiles" element={<Profiles />} />
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