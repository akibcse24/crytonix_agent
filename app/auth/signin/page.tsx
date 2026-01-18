'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Terminal, Github } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
    const { theme } = useTheme();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const isCyberpunk = theme === 'cyberpunk';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-black">
            <div
                className={`max-w-md w-full p-8 rounded-lg border ${isCyberpunk
                        ? 'bg-black border-cyan-500/30'
                        : 'bg-white border-purple-200 glass'
                    }`}
            >
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Terminal className={`w-16 h-16 ${isCyberpunk ? 'text-cyan-400' : 'text-purple-600'}`} />
                    </div>
                    <h1
                        className={`text-3xl font-bold ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                            }`}
                    >
                        {isCyberpunk ? 'CRYTONIX' : 'Crytonix'}
                    </h1>
                    <p className={`mt-2 ${isCyberpunk ? 'text-cyan-700 font-mono' : 'text-gray-500'}`}>
                        {isCyberpunk ? 'AUTHENTICATION REQUIRED' : 'Sign in to continue'}
                    </p>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={() => signIn('github', { callbackUrl })}
                        className={`w-full ${isCyberpunk
                                ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono'
                                : 'bg-gray-900 hover:bg-gray-800 text-white'
                            }`}
                    >
                        <Github className="w-5 h-5 mr-2" />
                        {isCyberpunk ? 'AUTHENTICATE WITH GITHUB' : 'Continue with GitHub'}
                    </Button>

                    <Button
                        onClick={() => signIn('google', { callbackUrl })}
                        className={`w-full ${isCyberpunk
                                ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono'
                                : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {isCyberpunk ? 'AUTHENTICATE WITH GOOGLE' : 'Continue with Google'}
                    </Button>
                </div>

                {/* Note */}
                <p
                    className={`text-xs text-center mt-6 ${isCyberpunk ? 'text-cyan-700 font-mono' : 'text-gray-500'
                        }`}
                >
                    {isCyberpunk
                        ? '> Secure OAuth authentication via NextAuth.js'
                        : 'Secure authentication powered by NextAuth.js'}
                </p>
            </div>
        </div>
    );
}
