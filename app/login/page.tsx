'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn, Sprout, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Demo mode: Accept any email/password for hackathon
        // In production, this would use Supabase Auth
        if (email && password) {
            // Store session in localStorage (demo purposes)
            localStorage.setItem('agroflow_user', JSON.stringify({
                email,
                name: email.split('@')[0],
                loggedInAt: new Date().toISOString()
            }));

            // Redirect to dashboard or intended page
            const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
            router.push(redirectTo);
        } else {
            setError('Please enter email and password');
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        setEmail('farmer@agroflow.demo');
        setPassword('demo123');
        localStorage.setItem('agroflow_user', JSON.stringify({
            email: 'farmer@agroflow.demo',
            name: 'Demo Farmer',
            loggedInAt: new Date().toISOString()
        }));
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
            <Card className="w-full max-w-md border-0 shadow-xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Sprout className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Welcome to Agroflow</CardTitle>
                        <CardDescription className="text-gray-500 mt-2">
                            Sign in to access your smart farming dashboard
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="farmer@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Sign In
                                </>
                            )}
                        </Button>
                    </form>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11"
                        onClick={handleDemoLogin}
                    >
                        🌾 Quick Demo Login
                    </Button>

                    <p className="text-center text-xs text-gray-400">
                        This is a hackathon demo. Any email/password combination will work.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
