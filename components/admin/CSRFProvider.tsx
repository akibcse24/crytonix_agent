/**
 * CSRF Protection Provider for Admin Panel
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface CSRFContextType {
    token: string | null;
    refreshToken: () => Promise<void>;
}

const CSRFContext = createContext<CSRFContextType>({
    token: null,
    refreshToken: async () => { },
});

export function CSRFProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    const refreshToken = async () => {
        try {
            const response = await fetch('/api/admin/csrf');
            const data = await response.json();
            setToken(data.token);

            // Store in cookie for validation
            document.cookie = `csrf-token=${data.token}; path=/; samesite=strict; secure`;
        } catch (error) {
            console.error('Failed to refresh CSRF token:', error);
        }
    };

    useEffect(() => {
        refreshToken();

        //Refresh token every 30 minutes
        const interval = setInterval(refreshToken, 30 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <CSRFContext.Provider value={{ token, refreshToken }}>
            {children}
        </CSRFContext.Provider>
    );
}

export function useCSRF() {
    return useContext(CSRFContext);
}

/**
 * Secure fetch wrapper with CSRF token
 */
export async function secureFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrf-token='))
        ?.split('=')[1];

    const headers = new Headers(options.headers);

    if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(options.method || 'GET')) {
        headers.set('x-csrf-token', csrfToken);
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });
}
