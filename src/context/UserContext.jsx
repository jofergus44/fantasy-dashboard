import { useState, createContext, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from local storage on initial mount
    useEffect(() => {
        const storedUser = localStorage.getItem('fantasy_football_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('fantasy_football_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (searchTerm) => {
        try {
            const term = searchTerm.toLowerCase().trim();
            let matchedUser = null;

            // 1. Fetch all users in our specific league to allow for flexible matching
            // (e.g. matching their custom team name or display name instead of just exact Sleeper username)
            const LEAGUE_ID = '1327673467570515968';
            const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`);

            if (leagueRes.ok) {
                const leagueUsers = await leagueRes.json();

                // Try to find a match in this order of priority:
                // A) Exact username match (case insensitive)
                // B) Exact display_name match (case insensitive)
                // C) Exact team_name match from metadata (case insensitive)
                matchedUser = leagueUsers.find(u =>
                    (u.username && u.username.toLowerCase() === term) ||
                    (u.display_name && u.display_name.toLowerCase() === term) ||
                    (u.metadata?.team_name && u.metadata.team_name.toLowerCase() === term)
                );
            }

            // 2. Fallback: If not found in the league (or league fetch failed), try the global Sleeper User API 
            // (This requires an exact username match)
            if (!matchedUser) {
                const res = await fetch(`https://api.sleeper.app/v1/user/${term}`);
                if (res.ok) {
                    matchedUser = await res.json();
                }
            }

            if (!matchedUser || !matchedUser.user_id) {
                throw new Error('User not found in league or global search');
            }

            const sessionUser = {
                username: matchedUser.username,
                user_id: matchedUser.user_id,
                avatar: matchedUser.avatar,
                display_name: matchedUser.display_name,
                team_name: matchedUser.metadata?.team_name
            };

            setUser(sessionUser);
            localStorage.setItem('fantasy_football_user', JSON.stringify(sessionUser));
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('fantasy_football_user');
    };

    return (
        <UserContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
