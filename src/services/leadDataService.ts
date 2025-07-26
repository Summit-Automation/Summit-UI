import { Lead, LeadStats } from '@/types/leadgen';
import { getLeadEntries } from '@/app/lib/services/leadServices/getLeadEntries';
import { getLeadStats } from '@/app/lib/services/leadServices/getLeadStats';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class LeadDataCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 30000; // 30 seconds

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

class LeadDataService {
  private cache = new LeadDataCache();
  private readonly LEADS_CACHE_KEY = 'leads';
  private readonly STATS_CACHE_KEY = 'stats';

  async getLeads(forceRefresh = false): Promise<Lead[]> {
    if (!forceRefresh) {
      const cached = this.cache.get<Lead[]>(this.LEADS_CACHE_KEY);
      if (cached) return cached;
    }

    const leads = await getLeadEntries();
    this.cache.set(this.LEADS_CACHE_KEY, leads);
    return leads;
  }

  async getStats(forceRefresh = false): Promise<LeadStats> {
    if (!forceRefresh) {
      const cached = this.cache.get<LeadStats>(this.STATS_CACHE_KEY);
      if (cached) return cached;
    }

    const stats = await getLeadStats();
    this.cache.set(this.STATS_CACHE_KEY, stats);
    return stats;
  }

  async getLeadsAndStats(forceRefresh = false): Promise<[Lead[], LeadStats]> {
    return Promise.all([
      this.getLeads(forceRefresh),
      this.getStats(forceRefresh)
    ]);
  }

  invalidateCache(): void {
    this.cache.clear();
  }

  invalidateLeads(): void {
    this.cache.invalidate(this.LEADS_CACHE_KEY);
  }

  invalidateStats(): void {
    this.cache.invalidate(this.STATS_CACHE_KEY);
  }
}

export const leadDataService = new LeadDataService();