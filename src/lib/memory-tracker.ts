/**
 * Memory usage tracking utilities for animation components
 * Monitors memory consumption and detects potential memory leaks
 */

import React from 'react';

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  componentCount: number;
  animationCount: number;
}

interface ComponentMemoryData {
  componentName: string;
  mountTime: number;
  initialMemory: number;
  currentMemory: number;
  memoryDelta: number;
  isAnimating: boolean;
}

interface MemoryAnalysis {
  trend: 'increasing' | 'stable' | 'decreasing';
  leakSuspected: boolean;
  recommendations: string[];
  criticalComponents: string[];
}

class MemoryTracker {
  private snapshots: MemorySnapshot[] = [];
  private componentData: Map<string, ComponentMemoryData> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private snapshotInterval = 5000; // 5 seconds

  /**
   * Start monitoring memory usage
   */
  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return;
    
    this.isMonitoring = true;
    this.takeSnapshot();
    
    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot();
    }, this.snapshotInterval);
  }

  /**
   * Stop monitoring memory usage
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Register a component for memory tracking
   */
  registerComponent(componentName: string, isAnimating = false): void {
    const currentMemory = this.getCurrentMemoryUsage();
    
    this.componentData.set(componentName, {
      componentName,
      mountTime: Date.now(),
      initialMemory: currentMemory,
      currentMemory,
      memoryDelta: 0,
      isAnimating
    });
  }

  /**
   * Unregister a component from memory tracking
   */
  unregisterComponent(componentName: string): void {
    this.componentData.delete(componentName);
  }

  /**
   * Update component animation status
   */
  updateComponentAnimationStatus(componentName: string, isAnimating: boolean): void {
    const data = this.componentData.get(componentName);
    if (data) {
      data.isAnimating = isAnimating;
      data.currentMemory = this.getCurrentMemoryUsage();
      data.memoryDelta = data.currentMemory - data.initialMemory;
    }
  }

  /**
   * Get current memory usage in MB
   */
  getCurrentMemoryUsage(): number {
    if (typeof window === 'undefined') return 0;

    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      }
    } catch (error) {
      console.warn('Memory API not available:', error);
    }

    return 0;
  }

  /**
   * Get memory usage percentage
   */
  getMemoryUsagePercentage(): number {
    if (typeof window === 'undefined') return 0;

    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
      }
    } catch (error) {
      console.warn('Memory API not available:', error);
    }

    return 0;
  }

  /**
   * Analyze memory usage patterns
   */
  analyzeMemoryUsage(): MemoryAnalysis {
    const analysis: MemoryAnalysis = {
      trend: 'stable',
      leakSuspected: false,
      recommendations: [],
      criticalComponents: []
    };

    if (this.snapshots.length < 3) {
      return analysis;
    }

    // Analyze memory trend
    const recentSnapshots = this.snapshots.slice(-10);
    const memoryValues = recentSnapshots.map(s => s.usedJSHeapSize);
    const trend = this.calculateTrend(memoryValues);

    analysis.trend = trend;

    // Check for memory leaks
    if (trend === 'increasing') {
      const memoryIncrease = memoryValues[memoryValues.length - 1] - memoryValues[0];
      const timeSpan = recentSnapshots[recentSnapshots.length - 1].timestamp - recentSnapshots[0].timestamp;
      const increaseRate = memoryIncrease / timeSpan; // bytes per ms

      if (increaseRate > 1000) { // More than 1KB per ms
        analysis.leakSuspected = true;
        analysis.recommendations.push('Potential memory leak detected. Check for unreleased event listeners or animation cleanup.');
      }
    }

    // Identify critical components
    this.componentData.forEach((data, componentName) => {
      if (data.memoryDelta > 5) { // More than 5MB increase
        analysis.criticalComponents.push(componentName);
      }
    });

    // Generate recommendations
    if (this.getMemoryUsagePercentage() > 80) {
      analysis.recommendations.push('High memory usage detected. Consider reducing concurrent animations.');
    }

    if (analysis.criticalComponents.length > 0) {
      analysis.recommendations.push(`Components with high memory usage: ${analysis.criticalComponents.join(', ')}`);
    }

    return analysis;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    current: number;
    peak: number;
    average: number;
    componentCount: number;
    animatingComponents: number;
  } {
    const currentMemory = this.getCurrentMemoryUsage();
    const memoryValues = this.snapshots.map(s => s.usedJSHeapSize / (1024 * 1024));
    
    return {
      current: currentMemory,
      peak: memoryValues.length > 0 ? Math.max(...memoryValues) : currentMemory,
      average: memoryValues.length > 0 ? memoryValues.reduce((sum, val) => sum + val, 0) / memoryValues.length : currentMemory,
      componentCount: this.componentData.size,
      animatingComponents: Array.from(this.componentData.values()).filter(d => d.isAnimating).length
    };
  }

  /**
   * Export memory data for analysis
   */
  exportMemoryData(): {
    snapshots: MemorySnapshot[];
    components: ComponentMemoryData[];
    analysis: MemoryAnalysis;
    stats: {
      current: number;
      peak: number;
      average: number;
      componentCount: number;
      animatingComponents: number;
    };
  } {
    return {
      snapshots: [...this.snapshots],
      components: Array.from(this.componentData.values()),
      analysis: this.analyzeMemoryUsage(),
      stats: this.getMemoryStats()
    };
  }

  /**
   * Clear all collected data
   */
  clearData(): void {
    this.snapshots = [];
    this.componentData.clear();
  }

  private takeSnapshot(): void {
    if (typeof window === 'undefined') return;

    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const snapshot: MemorySnapshot = {
          timestamp: Date.now(),
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          componentCount: this.componentData.size,
          animationCount: Array.from(this.componentData.values()).filter(d => d.isAnimating).length
        };

        this.snapshots.push(snapshot);

        // Keep only last 100 snapshots
        if (this.snapshots.length > 100) {
          this.snapshots.shift();
        }

        // Update component memory data
        const currentMemory = memory.usedJSHeapSize / (1024 * 1024);
        this.componentData.forEach((data) => {
          data.currentMemory = currentMemory;
          data.memoryDelta = currentMemory - data.initialMemory;
        });
      }
    } catch (error) {
      console.warn('Failed to take memory snapshot:', error);
    }
  }

  private calculateTrend(values: number[]): 'increasing' | 'stable' | 'decreasing' {
    if (values.length < 2) return 'stable';

    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / first;

    if (change > 0.1) return 'increasing'; // 10% increase
    if (change < -0.1) return 'decreasing'; // 10% decrease
    return 'stable';
  }
}

// Singleton instance
export const memoryTracker = new MemoryTracker();

/**
 * React hook for component memory tracking
 */
export function useMemoryTracking(componentName: string) {
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    memoryTracker.registerComponent(componentName, isAnimating);

    return () => {
      memoryTracker.unregisterComponent(componentName);
    };
  }, [componentName]);

  React.useEffect(() => {
    memoryTracker.updateComponentAnimationStatus(componentName, isAnimating);
  }, [componentName, isAnimating]);

  const startAnimation = () => setIsAnimating(true);
  const stopAnimation = () => setIsAnimating(false);

  return {
    startAnimation,
    stopAnimation,
    isAnimating
  };
}

