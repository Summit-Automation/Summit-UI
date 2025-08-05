import { NextRequest, NextResponse } from 'next/server';
import { exportSavedPropertyToLead } from '@/app/lib/services/gisServices/exportGISPropertyToLead';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { savedPropertyId } = body as { savedPropertyId: string };

    if (!savedPropertyId) {
      return NextResponse.json(
        { error: 'Saved property ID is required' },
        { status: 400 }
      );
    }

    const result = await exportSavedPropertyToLead(savedPropertyId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      leadId: result.leadId,
      message: 'Property successfully exported to leads'
    });

  } catch (error) {
    console.error('Error in export leads API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}