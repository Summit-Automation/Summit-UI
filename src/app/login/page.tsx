'use client';

import { login, resetPassword } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, X, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        setResetMessage(null);

        try {
            const formData = new FormData();
            formData.append('email', resetEmail);
            const result = await resetPassword(formData);
            setResetMessage({ type: 'success', text: result.message });
            setResetEmail('');
        } catch (error) {
            setResetMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'Failed to send reset email' 
            });
        } finally {
            setResetLoading(false);
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
                <Card className="w-full max-w-md relative z-10 modal-enhanced card-enhanced data-appear">
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
                                {/* Enhanced glow effect behind logo */}
                                <div className="absolute inset-0 -z-10 bg-blue-500/30 blur-xl rounded-full transform scale-150 opacity-60" />
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-3">
                            <CardTitle className="text-xl sm:text-2xl font-bold text-gradient">
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
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none z-10 icon-interactive" />
                                    <Input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        required
                                        className="input-enhanced focus-enhanced pl-10 h-12 rounded-lg transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="login-password" className="text-slate-300 text-sm font-medium">
                                    Password
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none z-10 icon-interactive" />
                                    <Input
                                        id="login-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        required
                                        className="input-enhanced focus-enhanced pl-10 pr-12 h-12 rounded-lg transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200 btn-feedback p-1 rounded z-10 icon-interactive"
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
                                    className="button-enhanced w-full h-12 rounded-lg font-semibold btn-feedback btn-pulse"
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
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 icon-interactive" />
                                        </div>
                                    )}
                                </Button>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowResetModal(true)}
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

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 data-appear">
                    <Card className="w-full max-w-md modal-enhanced card-enhanced">
                        <CardHeader className="space-y-4 text-center px-6 sm:px-8 pt-8 pb-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold text-gradient">
                                    Reset Password
                                </CardTitle>
                                <button
                                    onClick={() => {
                                        setShowResetModal(false);
                                        setResetMessage(null);
                                        setResetEmail('');
                                    }}
                                    className="text-slate-400 hover:text-slate-300 transition-colors btn-feedback p-1 rounded icon-interactive"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <CardDescription className="text-slate-400 text-sm leading-relaxed">
                                Enter your email address and we&apos;ll send you a link to reset your password
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-6 sm:px-8 pb-8">
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                {/* Reset Message */}
                                {resetMessage && (
                                    <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                                        resetMessage.type === 'success' 
                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                    }`}>
                                        {resetMessage.type === 'success' ? (
                                            <CheckCircle className="h-4 w-4 icon-interactive" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 icon-interactive" />
                                        )}
                                        {resetMessage.text}
                                    </div>
                                )}

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email" className="text-slate-300 text-sm font-medium">
                                        Email Address
                                    </Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none z-10 icon-interactive" />
                                        <Input
                                            id="reset-email"
                                            type="email"
                                            placeholder="you@company.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                            className="input-enhanced focus-enhanced pl-10 h-12 rounded-lg transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowResetModal(false);
                                            setResetMessage(null);
                                            setResetEmail('');
                                        }}
                                        className="flex-1 h-12 rounded-lg"
                                        disabled={resetLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={resetLoading || !resetEmail}
                                        className="button-enhanced flex-1 h-12 rounded-lg font-semibold btn-feedback"
                                    >
                                        {resetLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Sending...
                                            </div>
                                        ) : (
                                            'Send Reset Email'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}