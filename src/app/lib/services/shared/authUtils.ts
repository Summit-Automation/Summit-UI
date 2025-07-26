'use server';

import { createClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Represents an authenticated user with organization context and Supabase client
 */
export interface AuthenticatedUser {
  /** The authenticated user object from Supabase */
  user: User;
  /** The organization ID associated with the user */
  organizationId: string;
  /** The Supabase client instance for database operations */
  supabase: SupabaseClient;
}

interface CacheEntry {
  user: User;
  organizationId: string;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number;
  ttl: number;
  cleanupInterval: number;
}

class AuthCache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private accessLock = new Set<string>();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize ?? 100,
      ttl: config.ttl ?? 60000, // 1 minute
      cleanupInterval: config.cleanupInterval ?? 300000 // 5 minutes
    };
    
    this.startCleanupTimer();
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > this.config.ttl) {
        this.cache.delete(key);
      }
    }
    
    // If still over limit, remove least recently used entries
    if (this.cache.size > this.config.maxSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
      
      const toRemove = this.cache.size - this.config.maxSize;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }
  }

  get(userId: string): CacheEntry | null {
    if (this.accessLock.has(userId)) {
      return null; // Prevent concurrent access
    }

    const entry = this.cache.get(userId);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > this.config.ttl) {
      this.cache.delete(userId);
      return null;
    }
    
    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = now;
    
    return entry;
  }

  set(userId: string, user: User, organizationId: string): void {
    if (this.accessLock.has(userId)) {
      return; // Prevent concurrent modifications
    }

    this.accessLock.add(userId);
    
    try {
      const now = Date.now();
      
      // Ensure we don't exceed max size
      if (this.cache.size >= this.config.maxSize && !this.cache.has(userId)) {
        this.cleanup();
      }
      
      this.cache.set(userId, {
        user,
        organizationId,
        timestamp: now,
        accessCount: 1,
        lastAccessed: now
      });
    } finally {
      this.accessLock.delete(userId);
    }
  }

  clear(): void {
    this.cache.clear();
    this.accessLock.clear();
  }

  invalidate(userId: string): void {
    this.cache.delete(userId);
    this.accessLock.delete(userId);
  }

  getMetrics() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        userId: key,
        accessCount: entry.accessCount,
        age: Date.now() - entry.timestamp,
        lastAccessed: Date.now() - entry.lastAccessed
      }))
    };
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

const authCache = new AuthCache();

/**
 * Gets the authenticated user with organization context and Supabase client.
 * 
 * This function handles user authentication, organization validation, and caching
 * to provide a consistent authentication interface across all service functions.
 * 
 * @returns Promise<AuthenticatedUser> Object containing user, organizationId, and supabase client
 * @throws {Error} When user is not authenticated
 * @throws {Error} When user organization is not found in metadata
 * 
 * @example
 * ```typescript
 * const { user, organizationId, supabase } = await getAuthenticatedUser();
 * 
 * // Use in database operations
 * const { data } = await supabase
 *   .from('leads')
 *   .select('*')
 *   .eq('organization_id', organizationId);
 * ```
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  try {
    const supabase = await createClient();
    
    // Get current user to use as cache key
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check cache first
    const cachedEntry = authCache.get(user.id);
    if (cachedEntry) {
      return {
        user: cachedEntry.user,
        organizationId: cachedEntry.organizationId,
        supabase
      };
    }

    // Get organization ID from user metadata
    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      throw new Error('User organization not found in metadata');
    }

    // Update cache
    authCache.set(user.id, user, organizationId);

    return {
      user,
      organizationId,
      supabase
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Clears all cached authentication data.
 * 
 * This function removes all cached user authentication data, forcing
 * fresh authentication on the next request.
 * 
 * @example
 * ```typescript
 * await clearAuthCache();
 * ```
 */
export async function clearAuthCache(): Promise<void> {
  authCache.clear();
}

/**
 * Invalidates cached authentication data for a specific user.
 * 
 * @param userId - The ID of the user whose cache should be invalidated
 * 
 * @example
 * ```typescript
 * await invalidateUserAuth('user-123');
 * ```
 */
export async function invalidateUserAuth(userId: string): Promise<void> {
  authCache.invalidate(userId);
}

/**
 * Gets metrics about the authentication cache performance.
 * 
 * Returns information about cache size, configuration, and individual entries
 * including access counts and cache age.
 * 
 * @returns Promise resolving to object containing cache metrics and statistics
 * 
 * @example
 * ```typescript
 * const metrics = await getAuthCacheMetrics();
 * console.log(`Cache size: ${metrics.size}/${metrics.maxSize}`);
 * ```
 */
export async function getAuthCacheMetrics() {
  return authCache.getMetrics();
}

/**
 * Destroys the authentication cache and cleans up resources.
 * 
 * This function stops all cleanup timers and clears all cached data.
 * Should be called when shutting down the application.
 * 
 * @example
 * ```typescript
 * // During application shutdown
 * await destroyAuthCache();
 * ```
 */
export async function destroyAuthCache(): Promise<void> {
  authCache.destroy();
}