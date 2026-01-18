'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    email: string;
    name: string;
    loggedInAt: string;
}

export function useAuth(requireAuth: boolean = true) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkAuth = () => {
        try {
            const storedUser = localStorage.getItem('agroflow_user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } else if (requireAuth) {
                // Redirect to login with return URL
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            if (requireAuth) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const login = (email: string, name: string) => {
        const userData: User = {
            email,
            name,
            loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('agroflow_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('agroflow_user');
        setUser(null);
        router.push('/login');
    };

    return { user, loading, login, logout, isAuthenticated: !!user };
}
