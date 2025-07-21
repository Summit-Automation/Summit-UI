'use client';

import { login } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            await login(formData);
        } catch (error) {
            console.error('Auth error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 md:w-80 md:h-80 md:-top-40 md:-right-40 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 md:w-80 md:h-80 md:-bottom-40 md:-left-40 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 py-8">
                {/* Login Card */}
                <Card className="w-full max-w-md relative z-10 bg-slate-900/80 border-slate-700 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-4 text-center px-4 sm:px-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                                Summit Automation
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm">
                                Sign in to your account
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="px-4 sm:px-6">
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email" className="text-slate-300">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        required
                                        className="pl-10 bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login-password" className="text-slate-300">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="login-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        required
                                        className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="relative z-10 p-4 text-center">
                <p className="text-xs text-slate-500">
                    © 2025 Summit Automation
                </p>
            </div>
        </div>
    );
}