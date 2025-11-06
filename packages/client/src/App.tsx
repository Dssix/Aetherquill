import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './stores/useAppStore.ts';
import { useThemeManager } from './hooks/useThemeManager.ts';
import { Toaster } from 'react-hot-toast';
import { getUserData } from './api/user.ts';

// Page Imports
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ProjectPage from './pages/ProjectPage.tsx';
import TimelinePage from './pages/TimelinePage.tsx';
import CharacterPage from './pages/CharacterPage.tsx';
import WritingRoomPage from './pages/WritingRoomPage.tsx';
import WorldsPage from './pages/WorldsPage.tsx';
import WritingViewerPage from './pages/WritingViewerPage.tsx';
import CharacterViewerPage from './pages/CharacterViewerPage.tsx';
import WorldViewerPage from './pages/WorldViewerPage.tsx';
import CataloguePage from './pages/CataloguePage.tsx';
import CatalogueItemViewerPage from './pages/CatalogueItemViewerPage.tsx';

// Component Imports
import Layout from './components/Layout.tsx';
import RegisterPage from "./pages/RegisterPage.tsx";
import { useLoadingManager } from './hooks/useLoadingManager.ts';
import AppShell from "./components/AppShell.tsx";

// This component protects routes that require a user to be logged in.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const currentUser = useAppStore((state) => state.currentUser);
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

// This component protects routes that require a project to be selected.
const ProjectScopeRoute = ({ children }: { children: React.ReactNode }) => {
    const currentProjectId = useAppStore((state) => state.currentProjectId);
    if (!currentProjectId) {
        // If no project is selected, send them back to the dashboard to choose one.
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}

function App() {

    const setUserData = useAppStore((state) => state.setUserData);
    const [isInitializing, setIsInitializing] = useState(true);

    // Calling theme manager, makes sure it's always running and listens to theme changes
    useThemeManager();
    useLoadingManager();


    useEffect(() => {
        const rehydrateSession = async () => {
            try {
                // Attempt to fetch user data. This will only succeed if a valid
                // httpOnly cookie exists from a previous session.
                const userData = await getUserData();
                // If it succeeds, hydrate the store.
                setUserData(userData);
            } catch {
                // If it fails (e.g., no cookie, expired cookie), the user is
                // effectively logged out. We don't need to do anything, as the
                // store's initial state is already logged-out.
                console.log('No active session found.');
            } finally {
                // In either case, initialization is complete.
                setIsInitializing(false);
            }
        };

        void rehydrateSession();
    }, [setUserData]);

    if (isInitializing) {
        return null; // Or a beautiful loading screen component
    }

    return (
        <BrowserRouter>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: 'hsl(var(--card))',
                        color: 'hsl(var(--card-foreground))',
                        border: '1px solid hsl(var(--border))',
                    },
                }}
            />
            <Routes>
                {/* --- Standalone Route --- */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* --- Protected Routes Wrapped in the Shared Layout --- */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route element={<AppShell />}>
                        {/* The Dashboard is the main page for a logged-in user. */}
                        <Route index element={<DashboardPage />} />

                        {/* All pages that require a project are nested inside this special protection route. */}
                        <Route path="project" element={<ProjectScopeRoute><ProjectPage /></ProjectScopeRoute>} />
                        <Route path="timeline" element={<ProjectScopeRoute><TimelinePage /></ProjectScopeRoute>} />
                        // Route for the Character view
                        <Route path="characters" element={<ProjectScopeRoute><CharacterPage /></ProjectScopeRoute>} />
                        <Route path="characters/:characterId" element={<CharacterViewerPage />} />
                        // Route for Writing room
                        <Route path="writing-room" element={<ProjectScopeRoute><WritingRoomPage /></ProjectScopeRoute>} />
                        <Route path="writing/:writingId" element={<ProjectScopeRoute><WritingViewerPage /></ProjectScopeRoute>} />
                        // Route for Worlds view
                        <Route path="worlds" element={<ProjectScopeRoute><WorldsPage /></ProjectScopeRoute>} />
                        <Route path="worlds/:worldId" element={<WorldViewerPage />} />
                        // Catalogue
                        <Route path="catalogue" element={<CataloguePage />} />
                        <Route path="catalogue/:itemId" element={<CatalogueItemViewerPage />} />
                    </Route>

                    {/* A catch-all for any unknown URL, redirecting to the user's dashboard. */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;