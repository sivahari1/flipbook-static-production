/**
 * Frame rate monitoring utilities for complex animations
 * Provides real-time FPS tracking and performance optimization suggestions
 */

import React from 'react';

interface FrameRateData {
  fps: number;
  timestamp: number;
  frameTime: number;
  dropped: boolean;
}

interface AnimationFrameMetrics {
  averageFps: number;
  minFps: number;
  maxFps: number;
  droppedFrames: number;
  totalFrames: number;
  duration: number;
}

class FrameRateMonitor {
  private frameData: FrameRateData[] = [];
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private isMonitoring = false;
  private targetFps = 60;
  private frameThreshold = 16.67; // 60fps = 16.67ms per frame

  /**
   * Start monitoring frame rate
   */
  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.scheduleNextFrame();
  }

  /**
   * Stop monitoring frame rate
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Get current FPS
   */
  getCurrentFps(): number {
    if (this.frameData.length === 0) return 0;
    
    const recentFrames = this.frameData.slice(-10); // Last 10 frames
    const avgFrameTime = recentFrames.reduce((sum, frame) => sum + frame.frameTime, 0) / recentFrames.length;
    
    return Math.round(1000 / avgFrameTime);
  }

  /**
   * Get comprehensive frame rate metrics
   */
  getMetrics(): AnimationFrameMetrics {
    if (this.frameData.length === 0) {
      return {
        averageFps: 0,
        minFps: 0,
        maxFps: 0,
        droppedFrames: 0,
        totalFrames: 0,
        duration: 0
      };
    }

    const fps = this.frameData.map(frame => frame.fps);
    const droppedFrames = this.frameData.filter(frame => frame.dropped).length;
    const duration = this.frameData[this.frameData.length - 1].timestamp - this.frameData[0].timestamp;

    return {
      averageFps: Math.round(fps.reduce((sum, f) => sum + f, 0) / fps.length),
      minFps: Math.min(...fps),
      maxFps: Math.max(...fps),
      droppedFrames,
      totalFrames: this.frameData.length,
      duration
    };
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    const currentFps = this.getCurrentFps();
    return currentFps >= 30; // Minimum acceptable FPS
  }

  /**
   * Get performance optimization suggestions
   */
  getOptimizationSuggestions(): string[] {
    const metrics = this.getMetrics();
    const suggestions: string[] = [];

    if (metrics.averageFps < 30) {
      suggestions.push('Average FPS is below 30. Consider reducing animation complexity or duration.');
    }

    if (metrics.droppedFrames > metrics.totalFrames * 0.1) {
      suggestions.push('High frame drop rate detected. Consider using CSS transforms instead of changing layout properties.');
    }

    if (metrics.minFps < 15) {
      suggestions.push('Severe frame drops detected. Consider implementing animation throttling or reducing concurrent animations.');
    }

    return suggestions;
  }

  /**
   * Clear collected data
   */
  clearData(): void {
    this.frameData = [];
  }

  /**
   * Export frame rate data for analysis
   */
  exportData(): {
    frameData: FrameRateData[];
    metrics: AnimationFrameMetrics;
    suggestions: string[];
  } {
    return {
      frameData: [...this.frameData],
      metrics: this.getMetrics(),
      suggestions: this.getOptimizationSuggestions()
    };
  }

  private scheduleNextFrame(): void {
    if (!this.isMonitoring) return;

    this.animationFrameId = requestAnimationFrame((currentTime) => {
      this.recordFrame(currentTime);
      this.scheduleNextFrame();
    });
  }

  private recordFrame(currentTime: number): void {
    const frameTime = currentTime - this.lastFrameTime;
    const fps = Math.round(1000 / frameTime);
    const dropped = frameTime > this.frameThreshold * 1.5; // 50% tolerance

    const frameData: FrameRateData = {
      fps,
      timestamp: currentTime,
      frameTime,
      dropped
    };

    this.frameData.push(frameData);

    // Keep only last 300 frames (5 seconds at 60fps)
    if (this.frameData.length > 300) {
      this.frameData.shift();
    }

    this.lastFrameTime = currentTime;

    // Log warnings for poor performance
    if (process.env.NODE_ENV === 'development' && dropped) {
      console.warn(`Frame drop detected: ${frameTime.toFixed(2)}ms (${fps}fps)`);
    }
  }
}

// Singleton instance
export const frameRateMonitor = new FrameRateMonitor();

/**
 * React hook for monitoring frame rate during animations
 */
export function useFrameRateMonitor() {
  const [isMonitoring, setIsMonitoring] = React.useState(false);
  const [currentFps, setCurrentFps] = React.useState(0);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isMonitoring) {
      frameRateMonitor.startMonitoring();
      
      // Update FPS display every 100ms
      intervalId = setInterval(() => {
        setCurrentFps(frameRateMonitor.getCurrentFps());
      }, 100);
    } else {
      frameRateMonitor.stopMonitoring();
    }

    return () => {
      frameRateMonitor.stopMonitoring();
      if (intervalId) clearInterval(intervalId);
    };
  }, [isMonitoring]);

  const startMonitoring = () => setIsMonitoring(true);
  const stopMonitoring = () => setIsMonitoring(false);
  const getMetrics = () => frameRateMonitor.getMetrics();
  const getSuggestions = () => frameRateMonitor.getOptimizationSuggestions();

  return {
    isMonitoring,
    currentFps,
    startMonitoring,
    stopMonitoring,
    getMetrics,
    getSuggestions,
    isPerformanceAcceptable: frameRateMonitor.isPerformanceAcceptable()
  };
}

