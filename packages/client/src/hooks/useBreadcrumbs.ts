import { useLocation, useParams } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore.ts';

// The blueprint for a breadcrumb remains the same.
export interface Breadcrumb {
    label: string;
    path: string;
}

export const useBreadcrumbs = (): Breadcrumb[] => {
    const location = useLocation();
    const params = useParams();

    const project = useAppStore(state =>
        state.currentProjectId ? state.userData?.projects[state.currentProjectId] : null
    );

    // If there's no active project, there's no trail to show.
    if (!project) {
        return [];
    }

    // --- THE NEW, SIMPLIFIED LOGIC ---

    // The base of our trail is always the Dashboard.
    const breadcrumbs: Breadcrumb[] = [{ label: 'Dashboard', path: '/' }];

    // The second step is ALWAYS the current project, linking to the project hub.
    breadcrumbs.push({ label: project.name, path: '/project' });

    // Now, we determine the rest of the trail based on the current page.
    const pathname = location.pathname;

    if (pathname.startsWith('/characters')) {
        breadcrumbs.push({ label: 'Living Souls', path: '/characters' });
        if (params.characterId) {
            const charName = project.characters.find(c => c.id === params.characterId)?.name;
            if (charName) breadcrumbs.push({ label: charName, path: pathname });
        }
    } else if (pathname.startsWith('/worlds')) {
        breadcrumbs.push({ label: 'Realms & Regions', path: '/worlds' });
        if (params.worldId) {
            const worldName = project.worlds.find(w => w.id === params.worldId)?.name;
            if (worldName) breadcrumbs.push({ label: worldName, path: pathname });
        }
    } else if (pathname.startsWith('/writing-room')) {
        breadcrumbs.push({ label: 'The Heart\'s Library', path: '/writing-room' });
    } else if (pathname.startsWith('/writing/')) {
        // For the detail page, we add the library link first.
        breadcrumbs.push({ label: 'The Heart\'s Library', path: '/writing-room' });
        if (params.writingId) {
            const writingTitle = project.writings.find(w => w.id === params.writingId)?.title;
            if (writingTitle) breadcrumbs.push({ label: writingTitle, path: pathname });
        }
    } else if (pathname.startsWith('/timeline')) {
        breadcrumbs.push({ label: 'Chronicle of Eras', path: '/timeline' });
    }

    return breadcrumbs;
};