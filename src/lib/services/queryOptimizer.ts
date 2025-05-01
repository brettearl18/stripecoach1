import { 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  getCountFromServer,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { performanceMonitor } from './performanceMonitor';

interface PaginationOptions {
  pageSize: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

interface QueryOptions {
  filters?: {
    field: string;
    operator: '<' | '<=' | '==' | '>=' | '>' | '!=' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
    value: any;
  }[];
  pagination?: PaginationOptions;
  select?: string[];
  volatility?: 'high' | 'medium' | 'low';
}

export class QueryOptimizer {
  private collectionName: string;
  private queryCache: Map<string, { 
    data: any[]; 
    timestamp: number;
    version: number;
    volatility: 'high' | 'medium' | 'low';
  }>;
  private subscriptions: Map<string, () => void>;
  private baselineCacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor(collectionName: string, volatility: 'high' | 'medium' | 'low' = 'medium') {
    this.collectionName = collectionName;
    this.queryCache = new Map();
    this.subscriptions = new Map();
    this.setupCollectionListener(volatility);
  }

  private getCacheDuration(volatility: 'high' | 'medium' | 'low'): number {
    switch (volatility) {
      case 'high': return this.baselineCacheDuration / 5; // 1 minute
      case 'low': return this.baselineCacheDuration * 2; // 10 minutes
      default: return this.baselineCacheDuration; // 5 minutes
    }
  }

  private setupCollectionListener(volatility: 'high' | 'medium' | 'low') {
    const collectionRef = collection(db, this.collectionName);
    const unsubscribe = onSnapshot(collectionRef, () => {
      // Invalidate cache based on volatility
      const now = Date.now();
      const maxAge = this.getCacheDuration(volatility);
      
      for (const [key, value] of this.queryCache.entries()) {
        if (now - value.timestamp > maxAge) {
          this.queryCache.delete(key);
        }
      }
    });

    this.subscriptions.set('collection', unsubscribe);
  }

  private buildQueryConstraints(options: QueryOptions): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    // Add filters
    if (options.filters) {
      options.filters.forEach(filter => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });
    }

    // Add pagination and ordering
    if (options.pagination) {
      const { orderByField = 'createdAt', orderDirection = 'desc' } = options.pagination;
      constraints.push(orderBy(orderByField, orderDirection));
      
      if (options.pagination.lastDoc) {
        constraints.push(startAfter(options.pagination.lastDoc));
      }
      
      constraints.push(limit(options.pagination.pageSize));
    }

    return constraints;
  }

  private getCacheKey(options: QueryOptions): string {
    return JSON.stringify({
      collection: this.collectionName,
      filters: options.filters,
      pagination: options.pagination ? {
        pageSize: options.pagination.pageSize,
        orderByField: options.pagination.orderByField,
        orderDirection: options.pagination.orderDirection
      } : null,
      select: options.select
    });
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.getCacheDuration('medium');
  }

  async executeQuery(options: QueryOptions): Promise<{
    data: any[];
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
    totalCount?: number;
    version: number;
  }> {
    const startTime = performance.now();
    const cacheKey = this.getCacheKey(options);
    const cachedResult = this.queryCache.get(cacheKey);

    if (cachedResult && this.isCacheValid(cachedResult.timestamp)) {
      performanceMonitor.trackCacheHit(this.collectionName, {
        queryOptions: options,
        cacheKey
      });

      const endTime = performance.now();
      performanceMonitor.trackResponseTime(
        `query/${this.collectionName}`,
        endTime - startTime,
        { cached: true, ...options }
      );

      return { 
        data: cachedResult.data,
        version: cachedResult.version
      };
    }

    performanceMonitor.trackCacheMiss(this.collectionName, {
      queryOptions: options,
      cacheKey
    });

    const constraints = this.buildQueryConstraints(options);
    const collectionRef = collection(db, this.collectionName);
    const q = query(collectionRef, ...constraints);

    try {
      let totalCount: number | undefined;
      if (options.pagination) {
        const snapshot = await getCountFromServer(collection(db, this.collectionName));
        totalCount = snapshot.data().count;
      }

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const currentVersion = Date.now();
      this.queryCache.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
        version: currentVersion,
        volatility: options.volatility || 'medium'
      });

      const endTime = performance.now();
      performanceMonitor.trackResponseTime(
        `query/${this.collectionName}`,
        endTime - startTime,
        { cached: false, ...options }
      );

      return {
        data: results,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        totalCount,
        version: currentVersion
      };
    } catch (error) {
      console.error(`Error executing query for ${this.collectionName}:`, error);
      throw error;
    }
  }

  clearCache(): void {
    this.queryCache.clear();
    // Clear all subscriptions
    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();
  }

  destroy(): void {
    this.clearCache();
  }
} 