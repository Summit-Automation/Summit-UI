'use client';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Handle the auth callback
        const handleAuthCallback = async () => {
            const { error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
                setMessage({ type: 'error', text: 'Invalid or expired reset link' });
            }
        };

        handleAuthCallback();
    }, [supabase.auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });
            
            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: 'Password updated successfully! Redirecting...' });
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'Failed to update password' 
            });
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
                {/* Reset Password Card */}
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
                                Set New Password
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm leading-relaxed">
                                Enter your new password below to complete the reset process
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="px-6 sm:px-8 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Message */}
                            {message && (
                                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                                    message.type === 'success' 
                                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}>
                                    {message.type === 'success' ? (
                                        <CheckCircle className="h-4 w-4 icon-interactive" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 icon-interactive" />
                                    )}
                                    {message.text}
                                </div>
                            )}

                            {/* New Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="new-password" className="text-slate-300 text-sm font-medium">
                                    New Password
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none z-10 icon-interactive" />
                                    <Input
                                        id="new-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-slate-300 text-sm font-medium">
                                    Confirm Password
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none z-10 icon-interactive" />
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="input-enhanced focus-enhanced pl-10 pr-12 h-12 rounded-lg transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200 btn-feedback p-1 rounded z-10 icon-interactive"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Update Button */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading || !password || !confirmPassword}
                                    className="button-enhanced w-full h-12 rounded-lg font-semibold btn-feedback btn-pulse"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Updating Password...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>Update Password</span>
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 icon-interactive" />
                                        </div>
                                    )}
                                </Button>
                            </div>

                            {/* Back to Login */}
                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => router.push('/login')}
                                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors btn-feedback p-1 rounded underline-offset-4 hover:underline"
                                >
                                    Back to Login
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
        </div>
    );
}