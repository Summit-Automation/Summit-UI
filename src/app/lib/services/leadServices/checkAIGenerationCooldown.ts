'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

export async function checkAIGenerationCooldown(): Promise<{ 
  canGenerate: boolean; 
  timeUntilNext?: number; 
  lastGeneration?: string;
}> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

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
    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const timeSinceLastGeneration = now.getTime() - lastGenerationTime.getTime();

    if (timeSinceLastGeneration >= twoHoursInMs) {
      return { canGenerate: true };
    } else {
      const timeUntilNext = twoHoursInMs - timeSinceLastGeneration;
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