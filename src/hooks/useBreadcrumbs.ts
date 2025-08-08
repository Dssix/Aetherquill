import { useLocation, useParams } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';

// The blueprint for a breadcrumb remains the same.
export interface Breadcrumb {
    label: string;
    path: string;
}

// This is the new, cleaner, and more robust custom hook.
export const useBreadcrumbs = (): Breadcrumb[] => {
    const location = useLocation();
    const params = useParams();

    // We use a selector to get only the data we need. This is more efficient.
    const project = useAppStore(state =>
        state.currentProjectId ? state.userData?.projects[state.currentProjectId] : null
    );

    // If there's no project, there are no breadcrumbs.
    if (!project) {
        return [];
    }

    // We start with a base breadcrumb for the project dashboard.
    const breadcrumbs: Breadcrumb[] = [{ label: 'Dashboard', path: '/' }];

    // We split the URL into its parts. e.g., "/characters/:characterId" -> ["characters", "some-id"]
    const pathnames = location.pathname.split('/').filter(Boolean);

    // We build the trail segment by segment.
    let currentPath = '';
    pathnames.forEach(segment => {
        currentPath += `/${segment}`;

        // We use a switch statement for clarity and scalability.
        switch (segment) {
            case 'project':
                breadcrumbs.push({ label: project.name, path: '/project' });
                break;
            case 'characters':
                // If there's a characterId in the URL, we are on a detail page.
                if (params.characterId) {
                    const charName = project.characters.find(c => c.id === params.characterId)?.name;
                    // We add the gallery link first, then the specific character name.
                    breadcrumbs.push({ label: 'Living Souls', path: '/characters' });
                    if (charName) breadcrumbs.push({ label: charName, path: currentPath });
                } else {
                    breadcrumbs.push({ label: 'Living Souls', path: currentPath });
                }
                break;
            case 'worlds':
                if (params.worldId) {
                    const worldName = project.worlds.find(w => w.id === params.worldId)?.name;
                    breadcrumbs.push({ label: 'Realms & Regions', path: '/worlds' });
                    if (worldName) breadcrumbs.push({ label: worldName, path: currentPath });
                } else {
                    breadcrumbs.push({ label: 'Realms & Regions', path: currentPath });
                }
                break;
            case 'writing-room':
                breadcrumbs.push({ label: 'The Heart\'s Library', path: currentPath });
                break;
            case 'writing':
                // The 'writing' segment is only for detail pages.
                if (params.writingId) {
                    const writingTitle = project.writings.find(w => w.id === params.writingId)?.title;
                    breadcrumbs.push({ label: 'The Heart\'s Library', path: '/writing-room' });
                    if (writingTitle) breadcrumbs.push({ label: writingTitle, path: currentPath });
                }
                break;
            case 'timeline':
                breadcrumbs.push({ label: 'Chronicle of Eras', path: currentPath });
                break;
            default:
                // We can ignore segments that are just IDs or unknown paths.
                break;
        }
    });

    return breadcrumbs;
};