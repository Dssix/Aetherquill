// packages/client/src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore.ts';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';

const LoginPage: React.FC = () => {
    // --- NEW: State for both username and password ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Get the refactored login action from our store.
    const login = useAppStore((state) => state.login);
    const navigate = useNavigate();

    /**
     * Handles the form submission for logging in.
     * This is now an async function that communicates with the backend via the store.
     */
    const handleLogin = async () => {
        const trimmedUsername = username.trim();
        if (!trimmedUsername || !password) {
            alert('Both name and secret word are required.');
            return;
        }

        try {
            // This now correctly calls the store with a single object.
            await login({ username: trimmedUsername, password });
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check thy name and secret word.');
        }
    };

    return (
        <main
            className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/parchment-bg.png')" }}
        >
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
                            className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"
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
                            className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"
                        />
                    </label>

                    <div className="text-center mt-6">
                        <Button type="submit">Enter the Scriptorium</Button>
                    </div>
                </form>
            </Card>
        </main>
    );
};

export default LoginPage;