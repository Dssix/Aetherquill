import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore.ts';
import { loadUserData, saveUserData, addUsernameToList } from '../utils/storage.ts';
import { type UserData } from 'aetherquill-common';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const login = useAppStore((state) => state.login);
    const navigate = useNavigate();

    const handleLogin = () => {
        const trimmedUsername = username.trim().toLowerCase();
        if (!trimmedUsername) {
            alert('A name is required to enter the scriptorium.');
            return;
        }

        // Try to load existing data for this user.
        let userData = loadUserData(trimmedUsername);

        // If no data exists, create a new user.
        if (!userData) {
            console.log(`No data found for user '${trimmedUsername}'. Creating new user.`);
            const newUserData: UserData = {
                username: trimmedUsername,
                projects: {}, // Start with an empty project list
            };
            saveUserData(newUserData);
            addUsernameToList(trimmedUsername);
            userData = newUserData;
        }

        // Log the user into our global state and redirect to the dashboard.
        login(trimmedUsername, userData);
        navigate('/');
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "url('/parchment-bg.png')" }}>
            <div className="text-center mb-12">
                <h1 className="text-7xl font-bold text-foreground font-serif">Aetherquill</h1>
                <p className="text-lg text-foreground/90 mt-2 italic">The Scribe's Sanctum</p>
            </div>
            <Card className="w-full max-w-sm">
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <label className="block">
                        <span className="text-sm font-semibold text-muted-foreground">Enter Thy Name, Scribe</span>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"
                            autoFocus
                        />
                    </label>
                    <div className="text-center mt-6">
                        <Button type="submit">
                            Enter the Scriptorium
                        </Button>
                    </div>
                </form>
            </Card>
        </main>
    );
};

export default LoginPage;