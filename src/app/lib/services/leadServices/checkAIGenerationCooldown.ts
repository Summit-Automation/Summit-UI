'use server';

import { createClient } from '@/utils/supabase/server';

export async function checkAIGenerationCooldown(): Promise<{ 
  canGenerate: boolean; 
  timeUntilNext?: number; 
  lastGeneration?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { canGenerate: false };
    }

    // Get organization ID from user metadata
    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      return { canGenerate: false };
    }

    // Check the last AI batch generation for this organization
    const { data: lastBatch, error } = await supabase
      .from('ai_batches')
      .select('created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking AI generation cooldown:', error);
      return { canGenerate: true }; // Allow generation if we can't check
    }

    if (!lastBatch) {
      // No previous generations, allow it
      return { canGenerate: true };
    }

    const lastGenerationTime = new Date(lastBatch.created_at);
    const now = new Date();
    const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    const timeSinceLastGeneration = now.getTime() - lastGenerationTime.getTime();

    if (timeSinceLastGeneration >= sixHoursInMs) {
      return { canGenerate: true };
    } else {
      const timeUntilNext = sixHoursInMs - timeSinceLastGeneration;
      return { 
        canGenerate: false, 
        timeUntilNext,
        lastGeneration: lastBatch.created_at
      };
    }

  } catch (error) {
    console.error('Error in checkAIGenerationCooldown:', error);
    return { canGenerate: true }; // Allow generation on error to prevent blocking users
  }
}