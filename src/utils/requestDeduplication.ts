// Request deduplication utility to prevent multiple identical concurrent requests

class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If there's already a pending request with this key, return it
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Create a new request
    const promise = requestFn().finally(() => {
      // Clean up the pending request when it completes
      this.pendingRequests.delete(key);
    });

    // Store the promise
    this.pendingRequests.set(key, promise);

    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }

  isPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Helper function to create deduplicated service methods
export function withDeduplication<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  keyGenerator: (...args: TArgs) => string
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const key = keyGenerator(...args);
    return requestDeduplicator.deduplicate(key, () => fn(...args));
  };
}