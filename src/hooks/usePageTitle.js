import { useEffect } from 'react';

/**
 * Custom hook to set page title dynamically
 * @param {string} title - The page title
 * @param {boolean} appendSiteName - Whether to append site name (default: true)
 */
export function usePageTitle(title, appendSiteName = true) {
    useEffect(() => {
        const siteName = 'Raj Travels';
        const fullTitle = appendSiteName && title 
            ? `${title} - ${siteName}` 
            : title || siteName;
        
        document.title = fullTitle;
        
        // Cleanup: reset to default title when component unmounts
        return () => {
            document.title = siteName;
        };
    }, [title, appendSiteName]);
}

/**
 * Set page title directly (for non-hook usage)
 * @param {string} title - The page title
 */
export function setPageTitle(title) {
    const siteName = 'Raj Travels';
    document.title = title ? `${title} - ${siteName}` : siteName;
}
