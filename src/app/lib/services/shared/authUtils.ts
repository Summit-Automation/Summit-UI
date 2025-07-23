'use server';

import { createClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  user: User;
  organizationId: string;
  supabase: SupabaseClient;
}

let authCache: {
  user: User;
  organizationId: string;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60000; // 1 minute cache for request lifecycle

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  try {
    const supabase = await createClient();
    
    // Check cache first (for request lifecycle caching)
    const now = Date.now();
    if (authCache && (now - authCache.timestamp) < CACHE_DURATION) {
      return {
        user: authCache.user,
        organizationId: authCache.organizationId,
        supabase
      };
    }
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get organization ID from user metadata
    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      throw new Error('User organization not found in metadata');
    }

    // Update cache
    authCache = {
      user,
      organizationId,
      timestamp: now
    };

    return {
      user,
      organizationId,
      supabase
    };
  } catch (error) {
    throw error;
  }
}

export async function clearAuthCache(): Promise<void> {
  authCache = null;
}