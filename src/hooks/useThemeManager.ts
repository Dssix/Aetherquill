import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';

// This is a special "side effect" hook. Its only job is to keep the
// <html> element's class in sync with our Zustand store's theme state.
export const useThemeManager = () => {
    // We select ONLY the theme from the store.
    const theme = useAppStore((state) => state.theme);

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove the old theme class.
        root.classList.remove('light', 'dark');
        // Add the new, current theme class.
        root.classList.add(theme);
    }, [theme]); // This effect runs only when the 'theme' value changes.
};