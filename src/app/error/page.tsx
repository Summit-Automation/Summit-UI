'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Please try again.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={() => window.location.href = '/'}
                            className="w-full"
                        >
                            Return to Dashboard
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            Try Again
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        If this problem persists, please contact support.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}