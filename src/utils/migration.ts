import { getAllUsernames, addUsernameToList, saveUserData } from './storage';
import { type UserData, type ProjectData } from '../dataModels/userData';

const DEFAULT_USERNAME = 'default';
const DEFAULT_PROJECT_ID = 'project_default';
const DEFAULT_PROJECT_NAME = 'My First Chronicle';

// This is the spell that will run once to migrate your old data.
export const runLegacyMigration = () => {
    const existingUsers = getAllUsernames();
    // If a user list already exists, we assume the migration has already run.
    if (existingUsers.length > 0) {
        return; // Do nothing.
    }

    console.log("Aetherquill: No users found. Running one-time legacy data migration...");

    // --- Step 1: Load data from the OLD localStorage keys ---
    // The '||' provides a safe fallback in case the old key doesn't exist.
    const legacyCharacters = JSON.parse(localStorage.getItem('aetherquill-characters-storage') || '{ "state": { "characters": [] } }').state.characters;
    const legacyWorlds = JSON.parse(localStorage.getItem('aetherquill-worlds-storage') || '{ "state": { "worlds": [] } }').state.worlds;
    const legacyWritings = JSON.parse(localStorage.getItem('aetherquill-writings-storage') || '{ "state": { "writings": [] } }').state.writings;
    const legacyTimeline = JSON.parse(localStorage.getItem('aetherquill-timeline-events-storage') || '{ "state": { "events": [] } }').state.events;

    // --- Step 2: Assemble the data into our new ProjectData structure ---
    const defaultProject: ProjectData = {
        projectId: DEFAULT_PROJECT_ID,
        name: DEFAULT_PROJECT_NAME,
        characters: legacyCharacters,
        worlds: legacyWorlds,
        writings: legacyWritings,
        timeline: legacyTimeline,
    };

    // --- Step 3: Assemble the ProjectData into our new UserData structure ---
    const defaultUserData: UserData = {
        username: DEFAULT_USERNAME,
        projects: {
            [DEFAULT_PROJECT_ID]: defaultProject,
        },
    };

    // --- Step 4: Save the new, structured data and update the user list ---
    saveUserData(defaultUserData);
    addUsernameToList(DEFAULT_USERNAME);

    console.log(`Migration complete. All legacy data has been saved under the user '${DEFAULT_USERNAME}'.`);
};