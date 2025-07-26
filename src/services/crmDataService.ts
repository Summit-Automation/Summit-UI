import { Customer } from '@/types/customer';
import { Interaction } from '@/types/interaction';
import { getCustomers } from '@/app/lib/services/crmServices/customer/getCustomers';
import { getInteractions } from '@/app/lib/services/crmServices/interaction/getInteractions';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CRMDataCache {
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

class CRMDataService {
  private cache = new CRMDataCache();
  private readonly CUSTOMERS_CACHE_KEY = 'customers';
  private readonly INTERACTIONS_CACHE_KEY = 'interactions';
  private readonly CRM_DATA_CACHE_KEY = 'crm-data';

  async getCustomers(forceRefresh = false): Promise<Customer[]> {
    if (!forceRefresh) {
      const cached = this.cache.get<Customer[]>(this.CUSTOMERS_CACHE_KEY);
      if (cached) return cached;
    }

    const customers = await getCustomers();
    this.cache.set(this.CUSTOMERS_CACHE_KEY, customers);
    return customers;
  }

  async getInteractions(forceRefresh = false): Promise<Interaction[]> {
    if (!forceRefresh) {
      const cached = this.cache.get<Interaction[]>(this.INTERACTIONS_CACHE_KEY);
      if (cached) return cached;
    }

    const interactions = await getInteractions();
    this.cache.set(this.INTERACTIONS_CACHE_KEY, interactions);
    return interactions;
  }

  async getCRMData(forceRefresh = false): Promise<{ customers: Customer[]; interactions: Interaction[] }> {
    if (!forceRefresh) {
      const cached = this.cache.get<{ customers: Customer[]; interactions: Interaction[] }>(this.CRM_DATA_CACHE_KEY);
      if (cached) return cached;
    }

    const [customers, interactions] = await Promise.all([
      this.getCustomers(forceRefresh),
      this.getInteractions(forceRefresh)
    ]);

    const data = { customers, interactions };
    this.cache.set(this.CRM_DATA_CACHE_KEY, data);
    return data;
  }

  invalidateCache(): void {
    this.cache.clear();
  }

  invalidateCustomers(): void {
    this.cache.invalidate(this.CUSTOMERS_CACHE_KEY);
    this.cache.invalidate(this.CRM_DATA_CACHE_KEY);
  }

  invalidateInteractions(): void {
    this.cache.invalidate(this.INTERACTIONS_CACHE_KEY);
    this.cache.invalidate(this.CRM_DATA_CACHE_KEY);
  }
}

export const crmDataService = new CRMDataService();