// packages/client/src/pages/RegisterPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore.ts';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // For user confirmation

    const register = useAppStore((state) => state.register);
    const isLoading = useAppStore((state) => state.isLoading);
    const navigate = useNavigate();

    /**
     * Handles the form submission for creating a new account.
     */
    const handleRegister = async () => {
        const trimmedUsername = username.trim();

        // Frontend validation before sending to the API.
        if (!trimmedUsername || !password) {
            alert('Both name and secret word are required.');
            return;
        }
        if (password !== confirmPassword) {
            alert('The secret words do not match.');
            return;
        }
        // You could add a password length check here as well for better UX.

        try {
            // Call the new register action from the store.
            await register({ username: trimmedUsername, password });

            // If the above line does not throw an error, registration was successful.
            // Navigate the user to the login page to use their new credentials.
            navigate('/login');
        } catch (error) {
            // The store already shows an error toast, so we just log it for debugging.
            console.error('Registration failed:', error);
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
                    Pledge Thy Name to the Order
                </p>
            </div>
            <Card className="w-full max-w-sm">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleRegister();
                    }}
                >
                    <label className="block">
            <span className="text-sm font-semibold text-muted-foreground">
              Choose Thy Name, Scribe
            </span>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"
                            autoFocus
                        />
                    </label>

                    <label className="block mt-4">
            <span className="text-sm font-semibold text-muted-foreground">
              Forge a Secret Word
            </span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"
                        />
                    </label>

                    <label className="block mt-4">
            <span className="text-sm font-semibold text-muted-foreground">
              Confirm the Secret Word
            </span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"
                        />
                    </label>

                    <div className="text-center mt-6">
                        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                            {isLoading ? 'Forging...' : 'Join the Scriptorium'}
                        </Button>
                    </div>
                </form>
            </Card>
            <p className="text-center text-sm text-muted-foreground mt-6">
                Already a member of the order?{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                    Enter the Scriptorium.
                </Link>
            </p>
        </main>
    );
};

export default RegisterPage;