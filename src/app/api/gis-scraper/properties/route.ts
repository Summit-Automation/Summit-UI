import { NextRequest, NextResponse } from 'next/server';
import { getScrapedProperties, getSavedProperties } from '@/app/lib/services/gisServices/getGISProperties';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'scraped'; // 'scraped' or 'saved'
    const searchSessionId = searchParams.get('session_id');

    if (type === 'saved') {
      const result = await getSavedProperties();
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        properties: result.properties,
        type: 'saved'
      });
    }

    // Default to scraped properties
    const result = await getScrapedProperties(searchSessionId || undefined);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      properties: result.properties,
      type: 'scraped'
    });

  } catch (error) {
    console.error('Error in GIS properties API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}