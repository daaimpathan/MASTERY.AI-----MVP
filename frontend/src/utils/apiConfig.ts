/**
 * API Configuration Utility
 * 
 * This file provides a centralized way to get API URLs for both development and production.
 * Use these functions instead of hardcoding localhost URLs.
 */

/**
 * Get the base API URL from environment variables
 * Falls back to localhost for development
 */
export const getApiBaseUrl = (): string => {
    // Standardize code to use VITE_API_BASE_URL
    let url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

    // Ensure it ends with /api/v1
    // This allows the user to just put the Render URL in the env var without worrying about the path
    if (!url.endsWith('/api/v1')) {
        // Remove trailing slash if present before appending
        url = url.endsWith('/') ? url.slice(0, -1) : url;
        url = `${url}/api/v1`;
    }

    return url;
};

/**
 * Get the full API endpoint URL
 * @param path - API endpoint path (e.g., '/api/v1/auth/login')
 * @returns Full URL to the API endpoint
 */
export const getApiUrl = (path: string): string => {
    const baseUrl = getApiBaseUrl();
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};

/**
 * Get the full URL for uploaded files (profile images, resources, etc.)
 * @param path - Relative path to the file (e.g., '/uploads/profile/image.jpg')
 * @returns Full URL to the file
 */
export const getFileUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    const baseUrl = getApiBaseUrl();
    // Handle paths that already start with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};

/**
 * Example usage:
 * 
 * // Instead of:
 * fetch('http://localhost:8000/api/v1/auth/login', ...)
 * 
 * // Use:
 * fetch(getApiUrl('/api/v1/auth/login'), ...)
 * 
 * // For profile images:
 * const imageUrl = getFileUrl(user.profile_image);
 */
