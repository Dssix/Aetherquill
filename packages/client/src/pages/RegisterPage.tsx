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
    const [error, setError] = useState<string | null>(null)

    const register = useAppStore((state) => state.register);
    const isLoading = useAppStore((state) => state.isLoading);
    const navigate = useNavigate();

    /**
     * Handles the form submission for creating a new account.
     */
    const handleRegister = async () => {
        // Clear any previous errors at the start of a new attempt.
        setError(null);
        const trimmedUsername = username.trim();

        // Frontend validation before sending to the API.
        if (!trimmedUsername || !password) {
            setError('Both name and secret word are required.');
            return;
        }
        if (password !== confirmPassword) {
            setError('The secret words do not match.');
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
            // The store action throws a standard Error object. We can inspect it
            // to safely extract the message.
            if (error instanceof Error) {
                // Inside this block, TypeScript knows that 'error' is an Error object.
                setError(error.message);
                console.error('Registration failed:', error.message);
            } else {
                // As a fallback, if something unexpected was thrown, handle it gracefully.
                const unknownErrorMessage = 'An unexpected error occurred during registration.';
                setError(unknownErrorMessage);
                console.error(unknownErrorMessage, error);
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
                            // 1. Conditionally apply a red border if there is an error.
                            className={`w-full p-2 mt-1 bg-input/50 border-b-2 focus:outline-none focus:border-primary ${
                                error ? 'border-destructive' : 'border-border'
                            }`}
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

                    {error && (
                        <p className="text-sm text-destructive mt-4 text-center">{error}</p>
                    )}

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