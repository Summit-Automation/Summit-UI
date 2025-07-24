import { NextRequest, NextResponse } from 'next/server';
import { processRecurringPayments } from '@/app/lib/services/bookkeeperServices/processRecurringPayments';

export async function POST(request: NextRequest) {
    try {
        // Optional: Add authentication/authorization
        const authHeader = request.headers.get('authorization');
        const expectedToken = process.env.CRON_SECRET;
        
        if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const result = await processRecurringPayments();

        return NextResponse.json({
            success: result.success,
            processed: result.processed,
            timestamp: new Date().toISOString(),
            ...(result.error && { error: result.error })
        });
    } catch (error) {
        console.error('Error in process-recurring-payments API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { message: 'Use POST method to process recurring payments' },
        { status: 405 }
    );
}