import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import WarRoom from './pages/WarRoom';
import TradeCalculator from './pages/TradeCalculator';
import MarketExplorer from './pages/MarketExplorer';
import PowerRankings from './pages/PowerRankings';
import './App.css';

function App() {
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
