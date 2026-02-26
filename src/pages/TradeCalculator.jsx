import React, { useState, useMemo } from 'react';
import { Search, Plus, X, ArrowRightLeft, ShieldAlert, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLeagueUsers, useLeagueRosters, usePlayers } from '../api/sleeper';
import './TradeCalculator.css';

// Simple heuristic: higher projection = higher "value". In a real app this would use KTC/FantasyCalc API for precise market values.
const calculatePlayerValue = (player) => {
    if (!player) return 0;
    // Fallbacks: QBs generally high, WRs high, etc.
    let posMod = 1;
    if (player.position === 'QB') posMod = 1.8;
    if (player.position === 'WR') posMod = 1.5;
    if (player.position === 'RB') posMod = 1.3;
    if (player.position === 'TE') posMod = 1.1;

    // Extremely rough mockup for "Ros Proj" based on name popularity for demo purposes
    const baseVal = (player.search_rank || 500) < 50 ? 80 :
        (player.search_rank || 500) < 150 ? 50 : 20;

    return Math.round(baseVal * posMod);
};

const PlayerBadge = ({ player, value, onRemove }) => (
    <div className="trade-player-badge glass-panel">
        <div className="tp-info">
            <span className="tp-pos">{player.position || 'FLEX'}</span>
            <div className="tp-name-group">
                <span className="tp-name">{player.first_name} {player.last_name}</span>
                <span className="tp-team">{player.team || 'FA'}</span>
            </div>
        </div>
        <div className="tp-actions">
            <div className="tp-value">{value}</div>
            <button className="tp-remove-btn" onClick={() => onRemove(player.player_id)}>
                <X size={16} />
            </button>
        </div>
    </div>
);

const TradeCalculator = () => {
    const { data: users, isLoading: usersLoading } = useLeagueUsers();
    const { data: rosters, isLoading: rostersLoading } = useLeagueRosters();
    const { data: playersData, isLoading: playersLoading } = usePlayers();

    const [teamAId, setTeamAId] = useState('');
    const [teamBId, setTeamBId] = useState('');

    const [teamASide, setTeamASide] = useState([]);
    const [teamBSide, setTeamBSide] = useState([]);

    const isLoading = usersLoading || rostersLoading || playersLoading;

    // Auto-select first two rosters for demo purposes, representing "You" and "Trade Partner"
    useMemo(() => {
        if (rosters && rosters.length >= 2 && !teamAId) {
            setTeamAId(rosters[0].roster_id);
            setTeamBId(rosters[1].roster_id);
        }
    }, [rosters, teamAId]);

    // Aggregate user mapping
    const activeTeams = useMemo(() => {
        if (!users || !rosters) return { a: null, b: null };
        const rA = rosters.find(r => r.roster_id === parseInt(teamAId));
        const rB = rosters.find(r => r.roster_id === parseInt(teamBId));

        const uA = users.find(u => u.user_id === rA?.owner_id);
        const uB = users.find(u => u.user_id === rB?.owner_id);

        return {
            a: {
                roster: rA,
                name: uA?.metadata?.team_name || uA?.display_name || 'Team A',
            },
            b: {
                roster: rB,
                name: uB?.metadata?.team_name || uB?.display_name || 'Team B',
            }
        };
    }, [users, rosters, teamAId, teamBId]);

    const totalValueA = teamASide.reduce((acc, pId) => acc + calculatePlayerValue(playersData[pId]), 0);
    const totalValueB = teamBSide.reduce((acc, pId) => acc + calculatePlayerValue(playersData[pId]), 0);
    const diff = Math.abs(totalValueA - totalValueB);

    const aWins = totalValueA > totalValueB;
    const isFair = diff <= 10;

    const handleRemoveA = (id) => setTeamASide(teamASide.filter(p => p !== id));
    const handleRemoveB = (id) => setTeamBSide(teamBSide.filter(p => p !== id));

    // --- Projections Engine ---
    // A rough approximation of ROS impact
    const aProjImpact = totalValueB - totalValueA; // If A receives B, they gain B's value and lose A's
    const bProjImpact = totalValueA - totalValueB;

    const aWinsImpact = (aProjImpact / 40); // 40 pts of value roughly = 1 win
    const bWinsImpact = (bProjImpact / 40);


    if (isLoading) {
        return (
            <div className="page-container loading-state">
                <Loader2 className="spinner" size={48} />
                <p>Loading League Assets...</p>
            </div>
        );
    }

    return (
        <div className="page-container trade-calculator">
            <div className="trade-header">
                <h2>Trade Analyzer</h2>
                <div className="context-warning">
                    <ShieldAlert size={18} className="warning-icon" />
                    <span>ROS Projections Active: Analyzing rest-of-season impact on starting lineups</span>
                </div>
            </div>

            {/* Projection Delta Header Component */}
            {(teamASide.length > 0 || teamBSide.length > 0) && (
                <div className="trade-projections-panel glass-panel">
                    <div className="proj-block">
                        <span className="proj-team">{activeTeams.a?.name} receives:</span>
                        <div className={`proj-delta ${aProjImpact > 0 ? 'positive' : 'negative'}`}>
                            {aProjImpact > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span className="proj-val">{aProjImpact > 0 ? '+' : ''}{aProjImpact} ROS Pts</span>
                            <span className="proj-wins">({aWinsImpact > 0 ? '+' : ''}{aWinsImpact.toFixed(1)} Exp Wins)</span>
                        </div>
                    </div>

                    <div className="proj-divider">vs</div>

                    <div className="proj-block">
                        <span className="proj-team">{activeTeams.b?.name} receives:</span>
                        <div className={`proj-delta ${bProjImpact > 0 ? 'positive' : 'negative'}`}>
                            {bProjImpact > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span className="proj-val">{bProjImpact > 0 ? '+' : ''}{bProjImpact} ROS Pts</span>
                            <span className="proj-wins">({bWinsImpact > 0 ? '+' : ''}{bWinsImpact.toFixed(1)} Exp Wins)</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="trade-analyzer-layout">
                {/* Team A Side (You) */}
                <div className="trade-column">
                    <div className="column-header you">
                        <select
                            className="team-selector"
                            value={teamAId}
                            onChange={e => { setTeamAId(e.target.value); setTeamASide([]); }}
                        >
                            {rosters?.map(r => {
                                const u = users?.find(user => user.user_id === r.owner_id);
                                const name = u?.metadata?.team_name || u?.display_name || `Team ${r.roster_id}`;
                                return <option key={r.roster_id} value={r.roster_id}>{name}</option>;
                            })}
                        </select>
                        <div className={`value-total ${aWins && !isFair ? 'winning' : ''}`}>
                            Value: {totalValueA}
                        </div>
                    </div>

                    <div className="player-search-bar">
                        <select
                            className="asset-picker"
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val && !teamASide.includes(val)) setTeamASide([...teamASide, val]);
                                e.target.value = "";
                            }}
                        >
                            <option value="">Add player to send...</option>
                            {activeTeams.a?.roster?.players?.map(pId => {
                                const p = playersData?.[pId];
                                if (!p) return null;
                                return <option key={pId} value={pId}>{p.first_name} {p.last_name} ({p.position})</option>;
                            })}
                        </select>
                    </div>

                    <div className="trade-assets-container">
                        {teamASide.length === 0 && (
                            <div className="empty-assets">
                                <Plus size={24} />
                                <p>Select players to trade away</p>
                            </div>
                        )}
                        {teamASide.map(pId => (
                            <PlayerBadge
                                key={`a-${pId}`}
                                player={playersData[pId]}
                                value={calculatePlayerValue(playersData[pId])}
                                onRemove={handleRemoveA}
                            />
                        ))}
                    </div>
                </div>

                {/* The VS / Verdict Center */}
                <div className="trade-center-verdict">
                    <div className="exchange-icon-wrapper">
                        <ArrowRightLeft size={32} className="exchange-icon" />
                    </div>

                    <div className={`trade-verdict glass-panel ${isFair ? 'fair' : (aWins ? 'a-wins' : 'b-wins')}`}>
                        <h4>Verdict</h4>
                        <div className="verdict-diff">
                            {isFair ? 'Fair Trade' : (aWins ? `Sending Wins by ${diff}` : `Receiving Wins by ${diff}`)}
                        </div>
                    </div>
                </div>

                {/* Team B Side (Them) */}
                <div className="trade-column">
                    <div className="column-header them">
                        <select
                            className="team-selector"
                            value={teamBId}
                            onChange={e => { setTeamBId(e.target.value); setTeamBSide([]); }}
                        >
                            {rosters?.map(r => {
                                if (r.roster_id === parseInt(teamAId)) return null;
                                const u = users?.find(user => user.user_id === r.owner_id);
                                const name = u?.metadata?.team_name || u?.display_name || `Team ${r.roster_id}`;
                                return <option key={r.roster_id} value={r.roster_id}>{name}</option>;
                            })}
                        </select>
                        <div className={`value-total ${!aWins && !isFair ? 'winning' : ''}`}>
                            Value: {totalValueB}
                        </div>
                    </div>

                    <div className="player-search-bar">
                        <select
                            className="asset-picker"
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val && !teamBSide.includes(val)) setTeamBSide([...teamBSide, val]);
                                e.target.value = "";
                            }}
                        >
                            <option value="">Add player to acquire...</option>
                            {activeTeams.b?.roster?.players?.map(pId => {
                                const p = playersData?.[pId];
                                if (!p) return null;
                                return <option key={pId} value={pId}>{p.first_name} {p.last_name} ({p.position})</option>;
                            })}
                        </select>
                    </div>

                    <div className="trade-assets-container">
                        {teamBSide.length === 0 && (
                            <div className="empty-assets">
                                <Plus size={24} />
                                <p>Select players to receive</p>
                            </div>
                        )}
                        {teamBSide.map(pId => (
                            <PlayerBadge
                                key={`b-${pId}`}
                                player={playersData[pId]}
                                value={calculatePlayerValue(playersData[pId])}
                                onRemove={handleRemoveB}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TradeCalculator;
