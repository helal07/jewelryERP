import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

/**
 * A custom hook to automatically trigger debounced Inertia router requests
 * when filter state changes (e.g. search, status, branch dropdowns).
 * 
 * @param {string} routeName - The Inertia route URL (e.g. route('sales.index'))
 * @param {object} params - The object containing filter states
 * @param {number} delay - The debounce delay in milliseconds (default: 400)
 */
export default function useFilter(routeName, params, delay = 400) {
    const isInitialRender = useRef(true);

    useEffect(() => {
        // Skip the initial mount so we don't fetch redundantly on page load
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            // Clean up empty params to keep URL clean
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
            );

            router.get(routeName, cleanParams, {
                preserveState: true,
                preserveScroll: true,
                replace: true, // Replaces current history state, preventing back-button bloat
            });
        }, delay);

        return () => clearTimeout(timeoutId);
    }, Object.values(params));
}
