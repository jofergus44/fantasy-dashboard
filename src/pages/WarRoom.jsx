import React from 'react';
import MatchupCard from '../components/MatchupCard';
import LeagueSidebar from '../components/LeagueSidebar';
import './Pages.css';

const WarRoom = () => {
    return (
        <div className="page-container">
            <h2>War Room</h2>
            <div className="war-room-layout">
                <div className="main-matchup-area">
                    <MatchupCard />
                </div>
                <aside className="league-scores-area">
                    <LeagueSidebar />
                </aside>
            </div>
        </div>
    );
};

export default WarRoom;
