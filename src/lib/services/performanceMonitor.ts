import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getPerformance } from 'firebase/performance';
import { db } from '../firebase/config';

interface PerformanceMetric {
  timestamp: Date;
  type: 'response_time' | 'cache_hit' | 'cache_miss';
  value: number;
  endpoint?: string;
  collection?: string;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsBuffer: PerformanceMetric[] = [];
  private readonly BUFFER_SIZE = 50;
  private readonly FLUSH_INTERVAL = 60000; // 1 minute
  private flushInterval: NodeJS.Timeout;

  private constructor() {
    this.setupPeriodicFlush();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPeriodicFlush() {
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
    }, this.FLUSH_INTERVAL);
  }

  private async flushMetrics() {
    if (this.metricsBuffer.length === 0) return;

    try {
      const batch = this.metricsBuffer.map(metric => ({
        ...metric,
        timestamp: Timestamp.fromDate(metric.timestamp)
      }));

      const metricsRef = collection(db, 'performance_metrics');
      await Promise.all(batch.map(metric => addDoc(metricsRef, metric)));
      
      this.metricsBuffer = [];
    } catch (error) {
      console.error('Error flushing performance metrics:', error);
    }
  }

  public trackResponseTime(endpoint: string, duration: number, metadata?: Record<string, any>) {
    this.addMetric({
      timestamp: new Date(),
      type: 'response_time',
      value: duration,
      endpoint,
      metadata
    });
  }

  public trackCacheHit(collection: string, metadata?: Record<string, any>) {
    this.addMetric({
      timestamp: new Date(),
      type: 'cache_hit',
      value: 1,
      collection,
      metadata
    });
  }

  public trackCacheMiss(collection: string, metadata?: Record<string, any>) {
    this.addMetric({
      timestamp: new Date(),
      type: 'cache_miss',
      value: 1,
      collection,
      metadata
    });
  }

  private addMetric(metric: PerformanceMetric) {
    this.metricsBuffer.push(metric);
    
    if (this.metricsBuffer.length >= this.BUFFER_SIZE) {
      this.flushMetrics();
    }
  }

  public async getMetrics(type: string, timeRange: { start: Date; end: Date }) {
    const metricsRef = collection(db, 'performance_metrics');
    const snapshot = await getDocs(query(
      metricsRef,
      where('type', '==', type),
      where('timestamp', '>=', timeRange.start),
      where('timestamp', '<=', timeRange.end)
    ));

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  public destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 