/**
 * Performance optimization utility for animations
 * Automatically adjusts animation settings based on device capabilities and performance
 */

import React from 'react';
import { performanceMonitor } from './performance-monitor';
import { frameRateMonitor } from './frame-rate-monitor';
import { memoryTracker } from './memory-tracker';

interface DeviceCapabilities {
  cpu: 'low' | 'medium' | 'high';
  memory: 'low' | 'medium' | 'high';
  gpu: 'low' | 'medium' | 'high';
  network: 'slow' | 'fast';
  battery: 'low' | 'medium' | 'high';
}

interface OptimizationSettings {
  animationQuality: 'low' | 'medium' | 'high';
  maxConcurrentAnimations: number;
  animationDuration: number; // Multiplier (0.5 = half speed, 2 = double speed)
  enableParticles: boolean;
  enableParallax: boolean;
  enableComplexTransitions: boolean;
  frameRateTarget: number;
}

interface PerformanceThresholds {
  minFps: number;
  maxMemoryUsage: number; // MB
  maxMemoryPercentage: number;
  maxFrameDrops: number;
}

class PerformanceOptimizer {
  private currentSettings: OptimizationSettings;
  private deviceCapabilities: DeviceCapabilities;
  private thresholds: PerformanceThresholds;
  private optimizationCallbacks: Array<(settings: OptimizationSettings) => void> = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.thresholds = {
      minFps: 30,
      maxMemoryUsage: 100, // 100MB
      maxMemoryPercentage: 80,
      maxFrameDrops: 10
    };

    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.currentSettings = this.generateOptimalSettings();
  }

  /**
   * Start automatic performance optimization
   */
  startOptimization(): void {
    if (this.monitoringInterval) return;

    // Monitor performance every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.checkAndOptimize();
    }, 5000);

    // Initial optimization
    this.checkAndOptimize();
  }

  /**
   * Stop automatic performance optimization
   */
  stopOptimization(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Get current optimization settings
   */
  getSettings(): OptimizationSettings {
    return { ...this.currentSettings };
  }

  /**
   * Subscribe to optimization changes
   */
  onOptimizationChange(callback: (settings: OptimizationSettings) => void): () => void {
    this.optimizationCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.optimizationCallbacks.indexOf(callback);
      if (index > -1) {
        this.optimizationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Manually trigger optimization
   */
  optimize(): void {
    this.checkAndOptimize();
  }

  /**
   * Get device capabilities assessment
   */
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const currentFps = frameRateMonitor.getCurrentFps();
    const memoryUsage = memoryTracker.getCurrentMemoryUsage();
    const memoryPercentage = memoryTracker.getMemoryUsagePercentage();

    if (currentFps < this.thresholds.minFps) {
      recommendations.push(`Frame rate (${currentFps}fps) is below target. Consider reducing animation complexity.`);
    }

    if (memoryUsage > this.thresholds.maxMemoryUsage) {
      recommendations.push(`Memory usage (${memoryUsage.toFixed(1)}MB) is high. Consider reducing concurrent animations.`);
    }

    if (memoryPercentage > this.thresholds.maxMemoryPercentage) {
      recommendations.push(`Memory percentage (${memoryPercentage.toFixed(1)}%) is high. Check for memory leaks.`);
    }

    if (this.deviceCapabilities.cpu === 'low') {
      recommendations.push('Low CPU detected. Consider disabling particle effects and complex animations.');
    }

    if (this.deviceCapabilities.memory === 'low') {
      recommendations.push('Low memory detected. Reduce concurrent animations and enable lazy loading.');
    }

    return recommendations;
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const capabilities: DeviceCapabilities = {
      cpu: 'medium',
      memory: 'medium',
      gpu: 'medium',
      network: 'fast',
      battery: 'high'
    };

    if (typeof window === 'undefined') return capabilities;

    try {
      // Detect CPU performance
      const startTime = performance.now();
      let iterations = 0;
      while (performance.now() - startTime < 10) {
        Math.random() * Math.random();
        iterations++;
      }
      
      if (iterations < 100000) capabilities.cpu = 'low';
      else if (iterations > 500000) capabilities.cpu = 'high';

      // Detect memory
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const totalMemoryMB = memory.jsHeapSizeLimit / (1024 * 1024);
        
        if (totalMemoryMB < 100) capabilities.memory = 'low';
        else if (totalMemoryMB > 500) capabilities.memory = 'high';
      }

      // Detect GPU (simplified)
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && 'getExtension' in gl && 'getParameter' in gl) {
        try {
          const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (typeof renderer === 'string') {
              if (renderer.includes('Intel') || renderer.includes('Software')) {
                capabilities.gpu = 'low';
              } else if (renderer.includes('NVIDIA') || renderer.includes('AMD')) {
                capabilities.gpu = 'high';
              }
            }
          }
        } catch (error) {
          // Fallback if WebGL debug info is not available
          capabilities.gpu = 'medium';
        }
      } else {
        capabilities.gpu = 'low';
      }

      // Detect network speed (simplified)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          capabilities.network = 'slow';
        }
      }

      // Detect battery status
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          if (battery.level < 0.2 || !battery.charging) {
            capabilities.battery = 'low';
          }
        });
      }

    } catch (error) {
      console.warn('Error detecting device capabilities:', error);
    }

    return capabilities;
  }

  private generateOptimalSettings(): OptimizationSettings {
    const settings: OptimizationSettings = {
      animationQuality: 'high',
      maxConcurrentAnimations: 10,
      animationDuration: 1,
      enableParticles: true,
      enableParallax: true,
      enableComplexTransitions: true,
      frameRateTarget: 60
    };

    // Adjust based on device capabilities
    if (this.deviceCapabilities.cpu === 'low') {
      settings.animationQuality = 'low';
      settings.maxConcurrentAnimations = 3;
      settings.animationDuration = 0.7; // Faster animations
      settings.enableParticles = false;
      settings.enableComplexTransitions = false;
      settings.frameRateTarget = 30;
    } else if (this.deviceCapabilities.cpu === 'medium') {
      settings.animationQuality = 'medium';
      settings.maxConcurrentAnimations = 6;
      settings.enableParticles = false; // Disable particles on medium devices
      settings.frameRateTarget = 45;
    }

    if (this.deviceCapabilities.memory === 'low') {
      settings.maxConcurrentAnimations = Math.min(settings.maxConcurrentAnimations, 3);
      settings.enableParallax = false;
    }

    if (this.deviceCapabilities.gpu === 'low') {
      settings.enableComplexTransitions = false;
      settings.animationQuality = 'low';
    }

    if (this.deviceCapabilities.battery === 'low') {
      settings.animationDuration = 0.5; // Very fast animations to save battery
      settings.enableParticles = false;
      settings.enableParallax = false;
      settings.frameRateTarget = 30;
    }

    return settings;
  }

  private checkAndOptimize(): void {
    const currentFps = frameRateMonitor.getCurrentFps();
    const memoryUsage = memoryTracker.getCurrentMemoryUsage();
    const memoryPercentage = memoryTracker.getMemoryUsagePercentage();
    const frameMetrics = frameRateMonitor.getMetrics();

    let needsOptimization = false;
    const newSettings = { ...this.currentSettings };

    // Check FPS performance
    if (currentFps < this.thresholds.minFps) {
      needsOptimization = true;
      
      // Reduce animation quality
      if (newSettings.animationQuality === 'high') {
        newSettings.animationQuality = 'medium';
      } else if (newSettings.animationQuality === 'medium') {
        newSettings.animationQuality = 'low';
      }

      // Reduce concurrent animations
      newSettings.maxConcurrentAnimations = Math.max(1, newSettings.maxConcurrentAnimations - 2);
      
      // Disable expensive features
      newSettings.enableParticles = false;
      if (currentFps < 20) {
        newSettings.enableParallax = false;
        newSettings.enableComplexTransitions = false;
      }
    }

    // Check memory usage
    if (memoryUsage > this.thresholds.maxMemoryUsage || memoryPercentage > this.thresholds.maxMemoryPercentage) {
      needsOptimization = true;
      newSettings.maxConcurrentAnimations = Math.max(1, newSettings.maxConcurrentAnimations - 1);
      newSettings.enableParallax = false;
    }

    // Check frame drops
    if (frameMetrics.droppedFrames > this.thresholds.maxFrameDrops) {
      needsOptimization = true;
      newSettings.animationDuration = Math.max(0.3, newSettings.animationDuration - 0.1);
    }

    // Apply optimizations if needed
    if (needsOptimization) {
      this.currentSettings = newSettings;
      this.notifyOptimizationChange();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance optimization applied:', {
          fps: currentFps,
          memory: `${memoryUsage.toFixed(1)}MB (${memoryPercentage.toFixed(1)}%)`,
          newSettings
        });
      }
    }
  }

  private notifyOptimizationChange(): void {
    this.optimizationCallbacks.forEach(callback => {
      try {
        callback(this.currentSettings);
      } catch (error) {
        console.error('Error in optimization callback:', error);
      }
    });
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

/**
 * React hook for using performance optimization
 */
export function usePerformanceOptimization() {
  const [settings, setSettings] = React.useState(performanceOptimizer.getSettings());
  const [isOptimizing, setIsOptimizing] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = performanceOptimizer.onOptimizationChange(setSettings);
    return unsubscribe;
  }, []);

  const startOptimization = () => {
    performanceOptimizer.startOptimization();
    setIsOptimizing(true);
  };

  const stopOptimization = () => {
    performanceOptimizer.stopOptimization();
    setIsOptimizing(false);
  };

  const optimize = () => {
    performanceOptimizer.optimize();
  };

  return {
    settings,
    isOptimizing,
    startOptimization,
    stopOptimization,
    optimize,
    deviceCapabilities: performanceOptimizer.getDeviceCapabilities(),
    recommendations: performanceOptimizer.getRecommendations()
  };
}

/**
 * Higher-order component that applies performance optimizations
 */
export function withPerformanceOptimization<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function OptimizedComponent(props: T) {
    const { settings } = usePerformanceOptimization();

    // Apply optimization settings to component props
    const optimizedProps = {
      ...props,
      animationQuality: settings.animationQuality,
      enableParticles: settings.enableParticles,
      enableParallax: settings.enableParallax,
      animationDuration: settings.animationDuration
    } as T;

    return React.createElement(WrappedComponent, optimizedProps);
  };
}