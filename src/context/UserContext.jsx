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

    const login = async (username) => {
        try {
            // Sleeper API requires searching user by exact username
            const res = await fetch(`https://api.sleeper.app/v1/user/${username}`);
            if (!res.ok) throw new Error('User not found');

            const userData = await res.json();

            if (!userData || !userData.user_id) {
                throw new Error('Invalid user data received');
            }

            const sessionUser = {
                username: userData.username,
                user_id: userData.user_id,
                avatar: userData.avatar,
                display_name: userData.display_name
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
