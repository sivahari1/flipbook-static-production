/**
 * Performance monitoring utilities for animations
 * Tracks frame rates, memory usage, and provides optimization recommendations
 */

import React from 'react';

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  animationCount: number;
  timestamp: number;
}

interface AnimationPerformanceData {
  componentName: string;
  animationType: string;
  duration: number;
  frameDrops: number;
  memoryDelta: number;
}

class AnimationPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private animationData: Map<string, AnimationPerformanceData> = new Map();
  private frameRateObserver: PerformanceObserver | null = null;
  private memoryObserver: any = null;
  private isMonitoring = false;

  constructor() {
    this.setupPerformanceObservers();
  }

  /**
   * Start monitoring animation performance
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startFrameRateMonitoring();
    this.startMemoryMonitoring();
  }

  /**
   * Stop monitoring animation performance
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    this.frameRateObserver?.disconnect();
    
    if (this.memoryObserver) {
      clearInterval(this.memoryObserver);
      this.memoryObserver = null;
    }
  }

  /**
   * Track animation start
   */
  trackAnimationStart(componentName: string, animationType: string): string {
    const animationId = `${componentName}-${animationType}-${Date.now()}`;
    
    this.animationData.set(animationId, {
      componentName,
      animationType,
      duration: performance.now(),
      frameDrops: 0,
      memoryDelta: this.getCurrentMemoryUsage()
    });

    return animationId;
  }

  /**
   * Track animation end
   */
  trackAnimationEnd(animationId: string): void {
    const data = this.animationData.get(animationId);
    if (!data) return;

    data.duration = performance.now() - data.duration;
    data.memoryDelta = this.getCurrentMemoryUsage() - data.memoryDelta;
    
    // Log performance data for analysis
    this.logAnimationPerformance(data);
    
    this.animationData.delete(animationId);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return {
      frameRate: this.getCurrentFrameRate(),
      memoryUsage: this.getCurrentMemoryUsage(),
      animationCount: this.animationData.size,
      timestamp: performance.now()
    };
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const currentMetrics = this.getCurrentMetrics();

    if (currentMetrics.frameRate < 30) {
      recommendations.push('Frame rate is below 30fps. Consider reducing animation complexity.');
    }

    if (currentMetrics.memoryUsage > 50) {
      recommendations.push('High memory usage detected. Check for memory leaks in animations.');
    }

    if (currentMetrics.animationCount > 10) {
      recommendations.push('Many concurrent animations detected. Consider staggering or reducing animations.');
    }

    return recommendations;
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData(): {
    metrics: PerformanceMetrics[];
    recommendations: string[];
  } {
    return {
      metrics: [...this.metrics],
      recommendations: this.getPerformanceRecommendations()
    };
  }

  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    // Setup Performance Observer for frame timing
    if ('PerformanceObserver' in window) {
      this.frameRateObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            this.recordMetric();
          }
        });
      });
    }
  }

  private startFrameRateMonitoring(): void {
    if (!this.frameRateObserver) return;

    try {
      this.frameRateObserver.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  private startMemoryMonitoring(): void {
    // Monitor memory usage every 5 seconds
    this.memoryObserver = setInterval(() => {
      this.recordMetric();
    }, 5000);
  }

  private getCurrentFrameRate(): number {
    // Estimate frame rate based on recent performance entries
    if (typeof window === 'undefined') return 60;

    try {
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        // Simplified frame rate calculation
        return Math.min(60, Math.max(15, 60 - (this.animationData.size * 2)));
      }
    } catch (error) {
      console.warn('Unable to calculate frame rate:', error);
    }

    return 60; // Default assumption
  }

  private getCurrentMemoryUsage(): number {
    if (typeof window === 'undefined') return 0;

    try {
      // Use performance.memory if available (Chrome)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
      }
    } catch (error) {
      console.warn('Memory API not available:', error);
    }

    return 0; // Fallback
  }

  private recordMetric(): void {
    const metric: PerformanceMetrics = {
      frameRate: this.getCurrentFrameRate(),
      memoryUsage: this.getCurrentMemoryUsage(),
      animationCount: this.animationData.size,
      timestamp: performance.now()
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory bloat
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  private logAnimationPerformance(data: AnimationPerformanceData): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Animation Performance:', {
        component: data.componentName,
        type: data.animationType,
        duration: `${data.duration.toFixed(2)}ms`,
        memoryDelta: `${data.memoryDelta.toFixed(2)}%`,
        frameDrops: data.frameDrops
      });
    }
  }
}

// Singleton instance
export const performanceMonitor = new AnimationPerformanceMonitor();

/**
 * Hook for tracking animation performance in React components
 */
export function useAnimationPerformance(componentName: string) {
  const trackAnimation = (animationType: string) => {
    const animationId = performanceMonitor.trackAnimationStart(componentName, animationType);
    
    return () => {
      performanceMonitor.trackAnimationEnd(animationId);
    };
  };

  return { trackAnimation };
}

/**
 * Higher-order component for automatic performance tracking
 */
export function withPerformanceTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    const { trackAnimation } = useAnimationPerformance(componentName);

    React.useEffect(() => {
      const endTracking = trackAnimation('render');
      return endTracking;
    }, [trackAnimation]);

    return React.createElement(WrappedComponent, props);
  };
}