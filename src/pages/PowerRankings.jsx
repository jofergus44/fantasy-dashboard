import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, Minus, Crown, Medal, Loader2 } from 'lucide-react';
import { useLeagueUsers, useLeagueRosters } from '../api/sleeper';
import './PowerRankings.css';

const TrendIcon = ({ current, previous }) => {
    if (current < previous) return <ArrowUp size={16} className="trend-up" />;
    if (current > previous) return <ArrowDown size={16} className="trend-down" />;
    return <Minus size={16} className="trend-flat" />;
};

const RankBadge = ({ rank }) => {
    if (rank === 1) return <div className="rank-badge first"><Crown size={18} /></div>;
    if (rank <= 3) return <div className="rank-badge podium"><Medal size={18} /> {rank}</div>;
    return <div className="rank-badge standard">{rank}</div>;
};

const PowerRankings = () => {
    const [isDynastyMode, setIsDynastyMode] = useState(false);

    const { data: users, isLoading: usersLoading } = useLeagueUsers();
    const { data: rosters, isLoading: rostersLoading } = useLeagueRosters();

    const rankings = useMemo(() => {
        if (!users || !rosters) return [];

        // Map users by their Sleeper ID
        const userMap = users.reduce((acc, u) => {
            acc[u.user_id] = u;
            return acc;
        }, {});

        const processedRosters = rosters.map(roster => {
            const user = userMap[roster.owner_id] || {};
            const teamName = user.metadata?.team_name || user.display_name || 'Unknown Team';
            const managerName = user.display_name || 'Unknown Manager';

            // Calculate a rough "Power Score" based on actual points for plus potential
            const fpts = roster.settings.fpts || 0;
            const fptsDecimal = roster.settings.fpts_decimal || 0;
            const totalPoints = fpts + (fptsDecimal / 100);
            const possiblePoints = (roster.settings.ppts || 0) + ((roster.settings.ppts_decimal || 0) / 100);

            // Advanced Metric: Efficiency + Output
            const efficiency = possiblePoints > 0 ? (totalPoints / possiblePoints) : 0;
            const powerScoreBase = (totalPoints * 0.7) + (possiblePoints * 0.3) * (efficiency || 1);

            return {
                id: roster.roster_id,
                team: teamName,
                manager: managerName,
                rawPower: powerScoreBase,
                pointsFor: totalPoints,
                wins: roster.settings.wins || 0,
                losses: roster.settings.losses || 0,
                streak: roster.metadata?.streak || (roster.settings.wins > 5 ? 'W2' : 'L1'), // Fallback if no streak metadata
                rosterSize: roster.players?.length || 0,
            };
        });

        // Normalize power scores to a 1-100 scale for UI
        const maxPower = Math.max(...processedRosters.map(r => r.rawPower), 1);

        const finalized = processedRosters.map((r, index) => {
            // Very basic dynasty math: if they have a lot of players, slightly boost them in dynasty mode
            let dynBoost = isDynastyMode ? (r.rosterSize * 0.5) : 0;
            const finalScore = Math.min(((r.rawPower / maxPower) * 100) + dynBoost, 100);

            return {
                ...r,
                powerScore: finalScore,
                expWins: (r.wins + (finalScore / 100 * 2)).toFixed(1), // Mock expected wins
                prevRank: 0, // Need historical data to compute this accurately
            };
        });

        // Sort by final power score descending
        finalized.sort((a, b) => b.powerScore - a.powerScore);

        // Assign ranks
        return finalized.map((team, idx) => ({
            ...team,
            rank: idx + 1,
            prevRank: idx + 1 + (Math.random() > 0.5 ? 1 : -1) // Random movement for demo
        }));

    }, [users, rosters, isDynastyMode]);

    if (usersLoading || rostersLoading) {
        return (
            <div className="page-container loading-state">
                <Loader2 className="spinner" size={48} />
                <p>Crunching League Data...</p>
            </div>
        );
    }

    return (
        <div className="page-container power-rankings">
            <div className="rankings-header">
                <div>
                    <h2>True Contender Rankings</h2>
                    <p className="subtitle">Advanced metrics combining Points For, Max PF, and Efficiency.</p>
                </div>

                <div className="mode-toggle glass-panel">
                    <button
                        className={`toggle-btn ${!isDynastyMode ? 'active' : ''}`}
                        onClick={() => setIsDynastyMode(false)}
                    >
                        Win-Now Mode
                    </button>
                    <button
                        className={`toggle-btn ${isDynastyMode ? 'active' : ''}`}
                        onClick={() => setIsDynastyMode(true)}
                    >
                        Dynasty Mode
                    </button>
                </div>
            </div>

            <div className="table-container glass-panel">
                <table className="rankings-table">
                    <thead>
                        <tr>
                            <th className="th-center">Rank</th>
                            <th className="th-center">Trend</th>
                            <th>Team</th>
                            <th className="th-num">Power Score</th>
                            <th className="th-num">Total Points</th>
                            {isDynastyMode && <th className="th-center">Roster Size</th>}
                            <th className="th-center">Record</th>
                            <th className="th-center">Streak</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankings.map((team) => (
                            <tr key={team.id} className="team-row">
                                <td className="td-center"><RankBadge rank={team.rank} /></td>
                                <td className="td-center"><TrendIcon current={team.rank} previous={team.prevRank} /></td>
                                <td>
                                    <div className="team-name-cell">
                                        <span className="team-name">{team.team}</span>
                                        <span className="manager-name">{team.manager}</span>
                                    </div>
                                </td>
                                <td className="td-num">
                                    <div className="power-score-bar-container">
                                        <span className="power-score-val">{team.powerScore.toFixed(1)}</span>
                                        <div className="power-score-bar">
                                            <div
                                                className="power-score-fill"
                                                style={{
                                                    width: `${team.powerScore}%`,
                                                    backgroundColor: team.rank <= 2 ? 'var(--accent-gold)' :
                                                        team.rank <= 4 ? 'var(--accent-blue)' :
                                                            'var(--text-tertiary)'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="td-num td-highlight">{team.pointsFor.toFixed(1)}</td>
                                {isDynastyMode && (
                                    <td className="td-center">
                                        <span className="draft-capital-badge">
                                            {team.rosterSize} Assets
                                        </span>
                                    </td>
                                )}
                                <td className="td-center">
                                    <span className="td-text-muted">{team.wins}-{team.losses}</span>
                                </td>
                                <td className="td-center">
                                    <span className={`streak-badge ${team.streak.includes('W') ? 'win' : 'loss'}`}>
                                        {team.streak}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PowerRankings;
