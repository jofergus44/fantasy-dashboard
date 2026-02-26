import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUser } from './context/UserContext';
import { Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import WarRoom from './pages/WarRoom';
import TradeCalculator from './pages/TradeCalculator';
import MarketExplorer from './pages/MarketExplorer';
import PowerRankings from './pages/PowerRankings';
import Login from './pages/Login';
import './App.css';

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
        <Loader2 className="spinner" size={48} style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<WarRoom />} />
          <Route path="/trade" element={<TradeCalculator />} />
          <Route path="/market" element={<MarketExplorer />} />
          <Route path="/power-rankings" element={<PowerRankings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
