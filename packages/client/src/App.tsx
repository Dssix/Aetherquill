import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './stores/useAppStore.ts';
import { loadUserData } from './utils/storage.ts';
import { useThemeManager } from './hooks/useThemeManager.ts';
import { Toaster } from 'react-hot-toast';

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

    const login = useAppStore((state) => state.login);
    const [isInitializing, setIsInitializing] = useState(true);

    // Calling theme manager, makes sure it's always running and listens to theme changes
    useThemeManager();

    useEffect(() => {
        const checkUser = () => {
            const savedUsername = localStorage.getItem('aetherquill__current_user');
            if (savedUsername) {
                const userData = loadUserData(savedUsername);
                if (userData) {
                    login(savedUsername, userData);
                }
            }
            setIsInitializing(false);
        };
        checkUser();
    }, [login]);

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

                {/* --- Protected Routes Wrapped in the Shared Layout --- */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
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
            </Routes>
        </BrowserRouter>
    );
}

export default App;