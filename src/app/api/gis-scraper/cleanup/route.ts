import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    // Check for force cleanup parameter
    const url = new URL(request.url);
    const forceCleanup = url.searchParams.get('force') === 'true';

    // Calculate the cutoff date
    const cutoffDate = new Date();
    
    if (forceCleanup) {
      // Force cleanup: delete all unsaved properties regardless of age
      console.log('Force cleanup requested - will delete all unsaved properties');
      cutoffDate.setFullYear(cutoffDate.getFullYear() + 1); // Set to future date to catch all
    } else {
      // Normal cleanup: 7 days ago
      cutoffDate.setDate(cutoffDate.getDate() - 7);
    }

    // First, let's check what properties exist for debugging
    const { data: allProperties, error: checkError } = await supabase
      .from('scraped_properties')
      .select('id, scraped_at, is_saved, created_at')
      .eq('user_id', user.id);

    if (checkError) {
      console.error('Error checking existing properties:', checkError);
    } else {
      console.log(`Found ${allProperties?.length || 0} total properties for user ${user.id}`);
      console.log('Properties:', allProperties);
    }

    // Delete old scraped properties that are not saved (is_saved = false)
    // and are older than 7 days
    console.log(`Cleanup: Looking for properties older than ${cutoffDate.toISOString()}`);
    
    const { data, error } = await supabase
      .from('scraped_properties')
      .delete()
      .eq('user_id', user.id)
      .eq('is_saved', false)
      .lt('scraped_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Error cleaning up scraped properties:', error);
      
      // Check if the error is because the table doesn't exist yet
      if (error.message?.includes('relation "scraped_properties" does not exist')) {
        return NextResponse.json({
          success: true,
          deleted_count: 0,
          message: 'No properties to cleanup - table not yet created'
        });
      }
      
      return NextResponse.json(
        { error: `Failed to cleanup GIS scraped properties: ${error.message}` },
        { status: 500 }
      );
    }

    const deletedCount = data?.length || 0;

    const message = forceCleanup 
      ? `Force cleaned up ${deletedCount} unsaved scraped properties`
      : `Cleaned up ${deletedCount} old scraped properties (older than 7 days)`;

    return NextResponse.json({
      success: true,
      deleted_count: deletedCount,
      message: message
    });

  } catch (error) {
    console.error('Error in cleanup API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}