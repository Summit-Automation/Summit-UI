import { Transaction } from '@/types/transaction';
import { getTransactions } from '@/app/lib/services/bookkeeperServices/getTransactions';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class TransactionDataCache {
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

class TransactionDataService {
  private cache = new TransactionDataCache();
  private readonly TRANSACTIONS_CACHE_KEY = 'transactions';

  async getTransactions(forceRefresh = false): Promise<Transaction[]> {
    if (!forceRefresh) {
      const cached = this.cache.get<Transaction[]>(this.TRANSACTIONS_CACHE_KEY);
      if (cached) return cached;
    }

    const transactions = await getTransactions();
    this.cache.set(this.TRANSACTIONS_CACHE_KEY, transactions);
    return transactions;
  }

  invalidateCache(): void {
    this.cache.clear();
  }

  invalidateTransactions(): void {
    this.cache.invalidate(this.TRANSACTIONS_CACHE_KEY);
  }
}

export const transactionDataService = new TransactionDataService();