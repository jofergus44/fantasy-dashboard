import { useQuery } from '@tanstack/react-query';

const BASE_URL = 'https://api.sleeper.app/v1';
export const LEAGUE_ID = '1327673467570515968';

// -- Fetchers --

export const fetchLeague = async () => {
    const res = await fetch(`${BASE_URL}/league/${LEAGUE_ID}`);
    if (!res.ok) throw new Error('Failed to fetch league');
    return res.json();
};

export const fetchUsers = async () => {
    const res = await fetch(`${BASE_URL}/league/${LEAGUE_ID}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
};

export const fetchRosters = async () => {
    const res = await fetch(`${BASE_URL}/league/${LEAGUE_ID}/rosters`);
    if (!res.ok) throw new Error('Failed to fetch rosters');
    return res.json();
};

export const fetchMatchups = async (week = 1) => {
    const res = await fetch(`${BASE_URL}/league/${LEAGUE_ID}/matchups/${week}`);
    if (!res.ok) throw new Error('Failed to fetch matchups');
    return res.json();
};

export const fetchNflState = async () => {
    const res = await fetch(`${BASE_URL}/state/nfl`);
    if (!res.ok) throw new Error('Failed to fetch NFL state');
    return res.json();
};

// We also need global player data to map player IDs to names/positions.
// Since Sleeper's player JSON is massive (40MB+), we will only fetch it once
// and ideally in a real app would cache it heavily. For this demo, we'll fetch it
// but you might want to consider using a smaller slice if performance dips.
export const fetchPlayers = async () => {
    const res = await fetch(`${BASE_URL}/players/nfl`);
    if (!res.ok) throw new Error('Failed to fetch players');
    return res.json();
};

// -- React Query Hooks --

export const useLeagueData = () => {
    return useQuery({
        queryKey: ['league', LEAGUE_ID],
        queryFn: fetchLeague,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useLeagueUsers = () => {
    return useQuery({
        queryKey: ['users', LEAGUE_ID],
        queryFn: fetchUsers,
        staleTime: 1000 * 60 * 60,
    });
};

export const useLeagueRosters = () => {
    return useQuery({
        queryKey: ['rosters', LEAGUE_ID],
        queryFn: fetchRosters,
        staleTime: 1000 * 60 * 5, // 5 mins
    });
};

export const useNflState = () => {
    return useQuery({
        queryKey: ['nflState'],
        queryFn: fetchNflState,
        staleTime: 1000 * 60 * 5,
    });
};

export const useMatchups = (week) => {
    const { data: nflState } = useNflState();
    const targetWeek = week || nflState?.leg || 1; // Fallback to 1 if no state

    return useQuery({
        queryKey: ['matchups', LEAGUE_ID, targetWeek],
        queryFn: () => fetchMatchups(targetWeek),
        enabled: !!targetWeek,
        staleTime: 1000 * 30, // 30 seconds for live scoring
        refetchInterval: 1000 * 30, // Poll every 30s
    });
};

// Warning: This loads the entire player list. We should map it down to only active offensive players ideally.
export const usePlayers = () => {
    return useQuery({
        queryKey: ['players'],
        queryFn: fetchPlayers,
        staleTime: Infinity, // Never stale, only changes once a day technically
    });
};
