'use client';

import { login } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';

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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 md:w-96 md:h-96 md:-top-48 md:-right-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 md:w-96 md:h-96 md:-bottom-48 md:-left-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-[32rem] md:h-[32rem] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 py-8 relative z-10">
                {/* Login Card */}
                <Card className="w-full max-w-md relative z-10 bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl card-interactive">
                    <CardHeader className="space-y-6 text-center px-6 sm:px-8 pt-8 pb-6">
                        {/* Logo */}
                        <div className="flex justify-center mb-2">
                            <div className="relative">
                                <Image
                                    src="/logo.svg"
                                    alt="Summit Automation"
                                    width={200}
                                    height={60}
                                    priority
                                    className="max-w-full h-auto drop-shadow-lg"
                                />
                                {/* Subtle glow effect behind logo */}
                                <div className="absolute inset-0 -z-10 bg-blue-500/20 blur-xl rounded-full transform scale-150" />
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-3">
                            <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                                Welcome Back
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm leading-relaxed">
                                Sign in to access your business automation dashboard
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="px-6 sm:px-8 pb-8">
                        <form action={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="login-email" className="text-slate-300 text-sm font-medium">
                                    Email Address
                                </Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none z-10" />
                                    <Input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        required
                                        className="pl-10 bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 input-feedback h-12 rounded-lg transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="login-password" className="text-slate-300 text-sm font-medium">
                                    Password
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none z-10" />
                                    <Input
                                        id="login-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        required
                                        className="pl-10 pr-12 bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 input-feedback h-12 rounded-lg transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200 btn-feedback p-1 rounded z-10"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 rounded-lg font-semibold btn-feedback btn-pulse"
                                    haptic
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Signing in...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>Sign In</span>
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    )}
                                </Button>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors btn-feedback p-1 rounded underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced Footer */}
            <div className="relative z-10 p-6 text-center">
                <div className="flex items-center justify-center space-x-4 mb-2">
                    <div className="w-12 h-px bg-slate-600"></div>
                    <p className="text-xs text-slate-500 font-medium">
                        © 2025 Summit Automation
                    </p>
                    <div className="w-12 h-px bg-slate-600"></div>
                </div>
                <p className="text-xs text-slate-600">
                    Powering business automation with AI
                </p>
            </div>

            {/* Floating particles for ambiance */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }} />
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }} />
                <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-emerald-400/40 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '5s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-yellow-400/40 rounded-full animate-ping" style={{ animationDelay: '3s', animationDuration: '3s' }} />
            </div>
        </div>
    );
}