import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { hasGISPermission } from '@/app/lib/services/gisServices/checkGISPermissions';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { savedPropertyId } = body as { savedPropertyId: string };

    if (!savedPropertyId) {
      return NextResponse.json(
        { error: 'Saved property ID is required' },
        { status: 400 }
      );
    }

    // Check GIS permissions via database
    const permissionCheck = await hasGISPermission();
    if (!permissionCheck.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied: GIS scraper not available for your organization' },
        { status: 403 }
      );
    }

    const { supabase } = await getAuthenticatedUser();

    // Delete the saved property
    const { error: deleteError } = await supabase
      .from('saved_properties')
      .delete()
      .eq('id', savedPropertyId);

    if (deleteError) {
      console.error('Error deleting saved property:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete saved property' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Property successfully deleted'
    });

  } catch (error) {
    console.error('Error in delete saved property API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}