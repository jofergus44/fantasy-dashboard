import React, { useState } from 'react';
import { Search, TrendingUp, Clock, Filter } from 'lucide-react';
import './MarketExplorer.css';

// Mock data representing recent real-world Sleeper trades
const recentTrades = [
    {
        id: 1,
        time: '2 mins ago',
        leagueType: '12-Team PPR',
        sideA: [{ name: 'J. Jefferson', pos: 'WR', team: 'MIN' }],
        sideB: [{ name: 'A. St. Brown', pos: 'WR', team: 'DET' }, { name: '2025 1st', pos: 'PICK', team: 'Early' }],
        analysis: 'Fair Value'
    },
    {
        id: 2,
        time: '14 mins ago',
        leagueType: '10-Team Superflex',
        sideA: [{ name: 'B. Purdy', pos: 'QB', team: 'SF' }],
        sideB: [{ name: 'T. Etienne', pos: 'RB', team: 'JAX' }],
        analysis: 'Overpay'
    },
    {
        id: 3,
        time: '45 mins ago',
        leagueType: '12-Team Half-PPR',
        sideA: [{ name: 'S. LaPorta', pos: 'TE', team: 'DET' }, { name: '2026 2nd', pos: 'PICK', team: 'Mid' }],
        sideB: [{ name: 'T. Kelce', pos: 'TE', team: 'KC' }, { name: 'R. Rice', pos: 'WR', team: 'KC' }],
        analysis: 'Steal'
    }
];

const TradeAsset = ({ asset }) => (
    <div className="market-asset">
        <span className={`asset-pos ${asset.pos === 'PICK' ? 'pick' : ''}`}>{asset.pos}</span>
        <span className="asset-name">{asset.name}</span>
        {asset.pos !== 'PICK' && <span className="asset-team">{asset.team}</span>}
    </div>
);

const MarketExplorer = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="page-container market-explorer">
            <div className="market-header">
                <div>
                    <h2>Market Explorer</h2>
                    <p className="subtitle">Real-time pulse of global Sleeper transactions.</p>
                </div>

                <div className="market-stats glass-panel">
                    <div className="stat">
                        <TrendingUp size={16} className="stat-icon" />
                        <span>Trending: P. Nacua (WR)</span>
                    </div>
                    <div className="stat">
                        <Clock size={16} className="stat-icon warning" />
                        <span>Panic Drop: K. Pitts (TE)</span>
                    </div>
                </div>
            </div>

            <div className="market-toolbar glass-panel">
                <div className="global-search">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search for a player or team to see recent deals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="filter-btn">
                    <Filter size={18} /> Filters
                </button>
            </div>

            <div className="feed-container">
                <h3>Recent Global Trades</h3>
                <div className="trade-feed">
                    {recentTrades.map(trade => (
                        <div key={trade.id} className="feed-card glass-panel">
                            <div className="feed-card-header">
                                <span className="trade-time"><Clock size={14} /> {trade.time}</span>
                                <span className="league-type">{trade.leagueType}</span>
                                <span className={`analysis-badge ${trade.analysis.toLowerCase().replace(' ', '-')}`}>
                                    {trade.analysis}
                                </span>
                            </div>

                            <div className="feed-card-body">
                                <div className="trade-side a">
                                    {trade.sideA.map((asset, i) => <TradeAsset key={i} asset={asset} />)}
                                </div>

                                <div className="feed-divider">
                                    <div className="exchange-line"></div>
                                    <span>FOR</span>
                                    <div className="exchange-line"></div>
                                </div>

                                <div className="trade-side b">
                                    {trade.sideB.map((asset, i) => <TradeAsset key={i} asset={asset} />)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarketExplorer;
