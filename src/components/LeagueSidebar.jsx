import React from 'react';
import './LeagueSidebar.css';

const mockLeagueMatchups = [
    {
        id: 1,
        teamA: { name: 'The Empire', score: 104.2, isWinning: true },
        teamB: { name: 'Rebel Scum', score: 98.7, isWinning: false },
        status: 'Live',
        timeRemaining: '2 games left'
    },
    {
        id: 2,
        teamA: { name: 'Grit & Grind', score: 121.5, isWinning: true },
        teamB: { name: 'Showtime', score: 76.1, isWinning: false },
        status: 'Final',
        timeRemaining: ''
    },
    {
        id: 3,
        teamA: { name: 'Waiver Wire Heroes', score: 88.4, isWinning: false },
        teamB: { name: 'Draft Day Steals', score: 92.0, isWinning: true },
        status: 'Live',
        timeRemaining: 'SNF (3Q)'
    }
];

const MiniMatchup = ({ matchup }) => {
    return (
        <div className="mini-matchup glass-panel">
            <div className="mini-status">
                <span className={`status-badge ${matchup.status === 'Live' ? 'live' : ''}`}>
                    {matchup.status}
                </span>
                <span className="time-remaining">{matchup.timeRemaining}</span>
            </div>

            <div className={`mini-team ${matchup.teamA.isWinning ? 'winning' : ''}`}>
                <span className="mini-name">{matchup.teamA.name}</span>
                <span className="mini-score">{matchup.teamA.score.toFixed(1)}</span>
            </div>

            <div className={`mini-team ${matchup.teamB.isWinning ? 'winning' : ''}`}>
                <span className="mini-name">{matchup.teamB.name}</span>
                <span className="mini-score">{matchup.teamB.score.toFixed(1)}</span>
            </div>
        </div>
    );
};

const LeagueSidebar = () => {
    return (
        <div className="league-sidebar">
            <h3 className="sidebar-title">Around The League</h3>
            <div className="matchup-list">
                {mockLeagueMatchups.map(m => (
                    <MiniMatchup key={m.id} matchup={m} />
                ))}
            </div>
        </div>
    );
};

export default LeagueSidebar;
