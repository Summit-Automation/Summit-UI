'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{
        error: Error | null;
        onRetry: () => void;
        onGoHome: () => void;
    }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo,
        });

        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.props.onError?.(error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return (
                    <FallbackComponent
                        error={this.state.error}
                        onRetry={this.handleRetry}
                        onGoHome={this.handleGoHome}
                    />
                );
            }

            return (
                <div className="min-h-[50vh] flex items-center justify-center p-6">
                    <Card className="w-full max-w-lg bg-slate-900/95 border border-slate-800/50 shadow-2xl">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="h-8 w-8 text-red-400" />
                            </div>
                            <CardTitle className="text-slate-50 text-xl font-semibold">
                                Something went wrong
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-base">
                                An unexpected error occurred. We apologize for the inconvenience.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <h4 className="text-red-400 font-medium text-sm mb-2">Error Details (Development Mode)</h4>
                                    <p className="text-red-300 text-xs font-mono break-words">
                                        {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo?.componentStack && (
                                        <details className="mt-2">
                                            <summary className="text-red-400 text-xs cursor-pointer hover:text-red-300">
                                                Component Stack
                                            </summary>
                                            <pre className="text-red-300 text-xs mt-2 overflow-x-auto">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                            
                            <div className="flex gap-3 justify-center">
                                <Button
                                    onClick={this.handleRetry}
                                    variant="default"
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    variant="outline"
                                    className="flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
                                >
                                    <Home className="h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;