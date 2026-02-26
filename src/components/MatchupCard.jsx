import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useLeagueUsers, useLeagueRosters, useMatchups, usePlayers } from '../api/sleeper';
import { useUser } from '../context/UserContext';
import './MatchupCard.css';

const PlayerRow = ({ playerId, points, rosterPositions, playersData, isReverse = false }) => {
    const player = playersData?.[playerId];

    if (!player) return null;

    // Clean up position if it's a defensive spot or weird flex
    let displayPos = player.position || 'FLEX';

    return (
        <div className={`player-row ${isReverse ? 'reverse' : ''}`}>
            <div className="player-info">
                <span className="player-pos">{displayPos}</span>
                <div className="player-details">
                    <span className="player-name">
                        {player.first_name?.charAt(0)}. {player.last_name}
                    </span>
                    <span className="player-matchup">{player.team || 'FA'}</span>
                </div>
            </div>
            <div className="player-score-block">
                <span className="player-score">{points.toFixed(1)}</span>
            </div>
        </div>
    );
};

const MatchupCard = () => {
    const { user } = useUser();
    const { data: users, isLoading: usersLoading } = useLeagueUsers();
    const { data: rosters, isLoading: rostersLoading } = useLeagueRosters();
    // Fetching week 17 as a static historical fallback since it's the offseason
    const { data: matchups, isLoading: matchupsLoading } = useMatchups(17);
    const { data: playersData, isLoading: playersLoading } = usePlayers();

    const isLoading = usersLoading || rostersLoading || matchupsLoading || playersLoading;

    const activeMatchup = useMemo(() => {
        if (!users || !rosters || !matchups || matchups.length === 0) return null;

        // Find the logged-in user's roster
        let userRoster = null;
        if (user && user.user_id) {
            userRoster = rosters.find(r => r.owner_id === user.user_id);
        }

        let targetMatchupId = 1; // Default to Matchup 1 if user not found/not in league
        if (userRoster) {
            const userMatchup = matchups.find(m => m.roster_id === userRoster.roster_id);
            if (userMatchup) targetMatchupId = userMatchup.matchup_id;
        }

        const matchupPair = matchups.filter(m => m.matchup_id === targetMatchupId);
        if (matchupPair.length !== 2) return null;

        // Ensure the logged-in user is ALWAYS Team A (on the left)
        let teamA = matchupPair[0];
        let teamB = matchupPair[1];

        if (userRoster && teamB.roster_id === userRoster.roster_id) {
            teamA = matchupPair[1];
            teamB = matchupPair[0];
        }

        const rosterA = rosters.find(r => r.roster_id === teamA.roster_id);
        const rosterB = rosters.find(r => r.roster_id === teamB.roster_id);

        const userA = users.find(u => u.user_id === rosterA?.owner_id);
        const userB = users.find(u => u.user_id === rosterB?.owner_id);

        return {
            teamA: {
                ...teamA,
                manager: userA?.display_name || 'Unknown',
                teamName: userA?.metadata?.team_name || userA?.display_name || 'Team A',
                avatar: userA?.avatar ? `https://sleepercdn.com/avatars/thumbs/${userA.avatar}` : 'https://sleepercdn.com/images/v2/icons/player_default.webp',
            },
            teamB: {
                ...teamB,
                manager: userB?.display_name || 'Unknown',
                teamName: userB?.metadata?.team_name || userB?.display_name || 'Team B',
                avatar: userB?.avatar ? `https://sleepercdn.com/avatars/thumbs/${userB.avatar}` : 'https://sleepercdn.com/images/v2/icons/player_default.webp',
            }
        };
    }, [users, rosters, matchups]);

    if (isLoading) {
        return (
            <div className="matchup-container glass-panel loading-state" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                <Loader2 className="spinner" size={48} />
                <p>Syncing Live Matchup...</p>
            </div>
        );
    }

    if (!activeMatchup) return <div className="matchup-container glass-panel"><p style={{ padding: '2rem', textAlign: 'center' }}>No active matchup found.</p></div>;

    const { teamA, teamB } = activeMatchup;

    const aWins = teamA.points > teamB.points;
    const bWins = teamB.points > teamA.points;

    // Calculate simple win prob bar based on current score ratio
    const totalScore = teamA.points + teamB.points;
    const aProb = totalScore > 0 ? (teamA.points / totalScore) * 100 : 50;

    return (
        <div className="matchup-container glass-panel">
            <div className="matchup-header">
                <div className="team-badge">
                    <img src={teamA.avatar} alt="Team A Avatar" className="avatar" />
                    <div className="team-info">
                        <h3>{teamA.teamName}</h3>
                        <span className="manager">{teamA.manager}</span>
                    </div>
                </div>

                <div className="score-display">
                    <div className={`score ${aWins ? 'winning' : 'losing'}`}>{teamA.points.toFixed(1)}</div>
                    <div className="win-prob-bar">
                        <div className="prob-fill" style={{ width: `${aProb}%` }}></div>
                    </div>
                    <div className={`score ${bWins ? 'winning' : 'losing'}`}>{teamB.points.toFixed(1)}</div>
                </div>

                <div className="team-badge reverse">
                    <div className="team-info">
                        <h3>{teamB.teamName}</h3>
                        <span className="manager">{teamB.manager}</span>
                    </div>
                    <img src={teamB.avatar} alt="Team B Avatar" className="avatar" />
                </div>
            </div>

            <div className="roster-comparison">
                <div className="roster-column">
                    {teamA.starters?.map((playerId, i) => (
                        <PlayerRow
                            key={`a-${i}-${playerId}`}
                            playerId={playerId}
                            points={teamA.starters_points[i] || 0}
                            playersData={playersData}
                        />
                    ))}
                </div>
                <div className="roster-divider"></div>
                <div className="roster-column">
                    {teamB.starters?.map((playerId, i) => (
                        <PlayerRow
                            key={`b-${i}-${playerId}`}
                            playerId={playerId}
                            points={teamB.starters_points[i] || 0}
                            playersData={playersData}
                            isReverse={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatchupCard;
