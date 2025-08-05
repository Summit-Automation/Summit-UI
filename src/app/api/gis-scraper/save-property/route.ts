import { NextRequest, NextResponse } from 'next/server';
import { saveProperty } from '@/app/lib/services/gisServices/saveProperty';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scrapedPropertyId } = body as { scrapedPropertyId: string };

    if (!scrapedPropertyId) {
      return NextResponse.json(
        { error: 'Scraped property ID is required' },
        { status: 400 }
      );
    }

    const result = await saveProperty(scrapedPropertyId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      savedProperty: result.savedProperty,
      message: 'Property successfully saved'
    });

  } catch (error) {
    console.error('Error in save property API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}