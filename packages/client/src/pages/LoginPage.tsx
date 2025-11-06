// packages/client/src/pages/LoginPage.tsx

import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore.ts';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';

const LoginPage: React.FC = () => {
    // --- NEW: State for both username and password ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Get the refactored login action from our store.
    const login = useAppStore((state) => state.login);
    const isLoading = useAppStore((state) => state.isLoading);
    const navigate = useNavigate();

    /**
     * Handles the form submission for logging in.
     * This is now an async function that communicates with the backend via the store.
     */
    const handleLogin = async () => {
        // Clear any previous errors on a new attempt.
        setError(null);
        const trimmedUsername = username.trim();
        if (!trimmedUsername || !password) {
            setError('Both name and secret word are required.');
            return;
        }

        try {
            // This now correctly calls the store with a single object.
            await login({ username: trimmedUsername, password });
            navigate('/');
        } catch (err) {
            // Catch the error thrown by the store and set its message to our local state.
            if (err instanceof Error) {
                setError(err.message);
                console.error('Login failed:', err.message);
            } else {
                const unknownErrorMessage = 'An unexpected error occurred during login.';
                setError(unknownErrorMessage);
                console.error(unknownErrorMessage, err);
            }
        }
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4">
            <div className="text-center mb-12">
                <h1 className="text-7xl font-bold text-foreground font-serif">
                    Aetherquill
                </h1>
                <p className="text-lg text-foreground/90 mt-2 italic">
                    The Scribe's Sanctum
                </p>
            </div>
            <Card className="w-full max-w-sm">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                >
                    <label className="block">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Enter Thy Name, Scribe
                    </span>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            // Conditionally apply the error border style
                            className={`w-full p-2 mt-1 bg-input/50 border-b-2 focus:outline-none focus:border-primary ${
                                error ? 'border-destructive' : 'border-border'
                            }`}
                            autoFocus
                        />
                    </label>

                    {/* --- NEW: Password Input Field --- */}
                    <label className="block mt-4">
                    <span className="text-sm font-semibold text-muted-foreground">
                      And Thy Secret Word
                    </span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            // Conditionally apply the error border style
                            className={`w-full p-2 mt-1 bg-input/50 border-b-2 focus:outline-none focus:border-primary ${
                                error ? 'border-destructive' : 'border-border'
                            }`}
                        />
                    </label>

                    {error && (
                        <p className="text-sm text-destructive mt-4 text-center">{error}</p>
                    )}

                    <div className="text-center mt-6">
                        <Button type="submit" isLoading={isLoading}>
                            {isLoading ? 'Entering...' : 'Enter the Scriptorium'}
                        </Button>
                    </div>
                </form>
            </Card>
            <p className="text-center text-sm text-muted-foreground mt-6">
                New to the order?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                    Pledge thy name.
                </Link>
            </p>
        </main>
    );
};

export default LoginPage;