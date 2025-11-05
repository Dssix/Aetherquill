// packages/client/src/hooks/useLoadingManager.ts

/**
 * @file This custom hook manages the global NProgress loading bar.
 * @description It subscribes to the `isLoading` state in the `useAppStore` and
 * controls the visibility of the top-level loading indicator, providing consistent
 * visual feedback for all asynchronous API calls throughout the application.
 */

import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Import the default styles for the progress bar
import { useAppStore } from '../stores/useAppStore';

// --- Custom Styling (Optional but Recommended) ---
// We can override the default NProgress CSS to match Aetherquill's aesthetic.
// This is a more advanced technique, but for now, we will add the CSS directly.
// In a real project, this would go in a dedicated CSS file.
const progressSpinnerStyle = `
  #nprogress .spinner {
    display: none !important;
  }
`;

export const useLoadingManager = () => {
    // 1. Select the 'isLoading' state from our global store.
    const isLoading = useAppStore((state) => state.isLoading);

    useEffect(() => {
        // 2. Inject our custom styles into the document head.
        const styleElement = document.createElement('style');
        styleElement.innerHTML = progressSpinnerStyle;
        document.head.appendChild(styleElement);

        // 3. The core logic: when 'isLoading' changes, control the progress bar.
        if (isLoading) {
            NProgress.start(); // If we are loading, start the bar.
        } else {
            NProgress.done(); // If we are done loading, complete and hide the bar.
        }

        // 4. Cleanup: remove the style element when the component unmounts.
        return () => {
            document.head.removeChild(styleElement);
        };
    }, [isLoading]); // This effect re-runs ONLY when the 'isLoading' state changes.
};