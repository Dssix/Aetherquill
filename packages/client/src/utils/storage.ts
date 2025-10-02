import { type UserData } from 'aetherquill-common';

const USERS_LIST_KEY = 'aetherquill__users';

// --- Functions for managing the list of all users ---

export const getAllUsernames = (): string[] => {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
};

export const addUsernameToList = (username: string) => {
    const users = getAllUsernames();
    if (!users.includes(username)) {
        users.push(username);
        localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    }
};

// --- Functions for managing a single user's data ---

const getUserStorageKey = (username: string) => `aetherquill__user__${username}`;

export const loadUserData = (username: string): UserData | null => {
    const raw = localStorage.getItem(getUserStorageKey(username));
    return raw ? JSON.parse(raw) : null;
};

export const saveUserData = (data: UserData) => {
    localStorage.setItem(getUserStorageKey(data.username), JSON.stringify(data));
};