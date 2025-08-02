import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import TimelinePage from './pages/TimelinePage';
import CharacterPage from './pages/CharacterPage';
import WritingRoomPage from './pages/WritingRoomPage';
import WorldsPage from './pages/WorldsPage';

import WritingViewerPage from './pages/WritingViewerPage';

function App() {
    return (
        <BrowserRouter>
            {/* The <Routes> component is the master controller.
          The outer <div> with background styles is no longer needed here,
          as the Layout component now handles it. */}
            <Routes>

                {/* --- Route Group 1: Standalone Pages --- */}
                {/* The Landing Page does not use the shared header and footer, so it gets its own direct route. */}
                <Route path="/" element={<LandingPage />} />

                {/* --- Route Group 2: Pages within the Shared Layout --- */}
                {/* This is the Layout Route. It has no 'path' itself, but it wraps all the child routes.
            Any route nested inside will be rendered where the <Outlet> is in Layout.tsx. */}
                <Route element={<Layout />}>
                    <Route path="/timeline" element={<TimelinePage />} />
                    <Route path="/characters" element={<CharacterPage />} />
                    <Route path="/writing-room" element={<WritingRoomPage />} />
                    <Route path="/writing/:writingId" element={<WritingViewerPage />} />
                    <Route path="/worlds" element={<WorldsPage />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;