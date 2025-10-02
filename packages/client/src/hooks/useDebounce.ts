import { useState, useEffect } from 'react';

// This custom hook takes a value and a delay.
// It will only return the latest value after the user has stopped typing for the specified delay.
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // This cleanup function runs every time the value changes,
        // cancelling the previous timer.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}