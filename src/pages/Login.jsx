import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsSubmitting(true);
        setError('');

        const success = await login(username.trim());

        if (!success) {
            setError('Could not find a Sleeper account with that username.');
            setIsSubmitting(false);
        }
        // On success, the App.jsx will automatically re-render and hide this component
    };

    return (
        <div className="login-container">
            <div className="login-box glass-panel">
                <div className="login-header">
                    <div className="logo-icon">🏈</div>
                    <h2>Fantasy Command Center</h2>
                    <p className="login-subtitle">Connect your Sleeper account to view your personalized dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Sleeper Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. SleeperKing99"
                            autoComplete="off"
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <ShieldAlert size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={!username.trim() || isSubmitting}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="spinner" size={20} /> Connecting...</>
                        ) : (
                            <>Connect Account <ArrowRight size={20} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
