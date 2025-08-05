import { NextRequest, NextResponse } from 'next/server';
import { scrapeLawrenceCountyGIS } from '@/app/lib/services/gisServices/scrapeLawrenceCountyGIS';
import { createScrapedProperties } from '@/app/lib/services/gisServices/createGISProperties';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { min_acreage, max_acreage } = body;

    // Township is no longer required - we'll search all townships

    if (min_acreage <= 0 || max_acreage <= 0) {
      return NextResponse.json(
        { error: 'Acreage values must be greater than 0' },
        { status: 400 }
      );
    }

    if (min_acreage > max_acreage) {
      return NextResponse.json(
        { error: 'Minimum acreage cannot be greater than maximum acreage' },
        { status: 400 }
      );
    }

    // Scrape GIS data and save to temporary scraped_properties table for auto-cleanup
    const scrapedProperties = await scrapeLawrenceCountyGIS({ min_acreage, max_acreage });
    const result = await createScrapedProperties(scrapedProperties);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to save properties for session tracking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      properties: result.properties,
      count: result.properties?.length || 0,
      criteria: { min_acreage, max_acreage },
      search_session_id: result.properties?.[0]?.search_session_id
    });

  } catch (error) {
    console.error('Error in GIS scraper API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}