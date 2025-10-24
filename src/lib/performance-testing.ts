/**
 * Automated performance testing utilities for animation-heavy pages
 * Provides comprehensive performance testing and benchmarking
 */

import React from 'react';
import { performanceMonitor } from './performance-monitor';
import { frameRateMonitor } from './frame-rate-monitor';
import { memoryTracker } from './memory-tracker';

interface PerformanceTestConfig {
  testName: string;
  duration: number; // Test duration in milliseconds
  targetFps: number;
  maxMemoryUsage: number; // Maximum acceptable memory usage in MB
  animationSelectors: string[]; // CSS selectors for animated elements
  interactions?: Array<{
    type: 'click' | 'scroll' | 'hover';
    selector: string;
    delay?: number;
  }>;
}

interface PerformanceTestResult {
  testName: string;
  passed: boolean;
  duration: number;
  metrics: {
    averageFps: number;
    minFps: number;
    maxFps: number;
    droppedFrames: number;
    memoryUsage: {
      initial: number;
      peak: number;
      final: number;
      leaked: number;
    };
    animationCount: number;
  };
  issues: string[];
  recommendations: string[];
  timestamp: number;
}

interface PerformanceBenchmark {
  testResults: PerformanceTestResult[];
  overallScore: number;
  criticalIssues: string[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageScore: number;
  };
}

class PerformanceTester {
  private testResults: PerformanceTestResult[] = [];
  private isRunning = false;

  /**
   * Run a single performance test
   */
  async runTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    if (this.isRunning) {
      throw new Error('Performance test already running');
    }

    this.isRunning = true;
    console.log(`Starting performance test: ${config.testName}`);

    try {
      // Initialize monitoring
      const initialMemory = memoryTracker.getCurrentMemoryUsage();
      performanceMonitor.startMonitoring();
      frameRateMonitor.startMonitoring();
      memoryTracker.startMonitoring();

      // Wait for initial setup
      await this.delay(100);

      // Execute interactions if specified
      if (config.interactions) {
        await this.executeInteractions(config.interactions);
      }

      // Run test for specified duration
      await this.delay(config.duration);

      // Collect metrics
      const frameMetrics = frameRateMonitor.getMetrics();
      const memoryStats = memoryTracker.getMemoryStats();
      const performanceData = performanceMonitor.exportPerformanceData();

      // Stop monitoring
      performanceMonitor.stopMonitoring();
      frameRateMonitor.stopMonitoring();
      memoryTracker.stopMonitoring();

      // Analyze results
      const result = this.analyzeTestResults(config, {
        frameMetrics,
        memoryStats,
        performanceData,
        initialMemory
      });

      this.testResults.push(result);
      return result;

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run multiple performance tests
   */
  async runTestSuite(configs: PerformanceTestConfig[]): Promise<PerformanceBenchmark> {
    const results: PerformanceTestResult[] = [];

    for (const config of configs) {
      try {
        const result = await this.runTest(config);
        results.push(result);
        
        // Wait between tests to allow cleanup
        await this.delay(1000);
      } catch (error) {
        console.error(`Test ${config.testName} failed:`, error);
      }
    }

    return this.generateBenchmark(results);
  }

  /**
   * Get test results
   */
  getTestResults(): PerformanceTestResult[] {
    return [...this.testResults];
  }

  /**
   * Clear test results
   */
  clearResults(): void {
    this.testResults = [];
  }

  /**
   * Export test results for analysis
   */
  exportResults(): {
    results: PerformanceTestResult[];
    benchmark: PerformanceBenchmark;
    timestamp: number;
  } {
    return {
      results: this.getTestResults(),
      benchmark: this.generateBenchmark(this.testResults),
      timestamp: Date.now()
    };
  }

  private async executeInteractions(interactions: PerformanceTestConfig['interactions']): Promise<void> {
    if (!interactions) return;

    for (const interaction of interactions) {
      try {
        const element = document.querySelector(interaction.selector);
        if (!element) {
          console.warn(`Element not found for selector: ${interaction.selector}`);
          continue;
        }

        switch (interaction.type) {
          case 'click':
            (element as HTMLElement).click();
            break;
          case 'hover':
            element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            break;
          case 'scroll':
            element.scrollIntoView({ behavior: 'smooth' });
            break;
        }

        if (interaction.delay) {
          await this.delay(interaction.delay);
        }
      } catch (error) {
        console.warn(`Failed to execute interaction:`, error);
      }
    }
  }

  private analyzeTestResults(
    config: PerformanceTestConfig,
    data: {
      frameMetrics: any;
      memoryStats: any;
      performanceData: any;
      initialMemory: number;
    }
  ): PerformanceTestResult {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Analyze frame rate
    if (data.frameMetrics.averageFps < config.targetFps) {
      issues.push(`Average FPS (${data.frameMetrics.averageFps}) below target (${config.targetFps})`);
      recommendations.push('Consider reducing animation complexity or using CSS transforms');
    }

    if (data.frameMetrics.minFps < 15) {
      issues.push(`Severe frame drops detected (min FPS: ${data.frameMetrics.minFps})`);
      recommendations.push('Implement animation throttling or reduce concurrent animations');
    }

    // Analyze memory usage
    const memoryLeak = data.memoryStats.current - data.initialMemory;
    if (memoryLeak > 10) { // More than 10MB increase
      issues.push(`Potential memory leak detected (${memoryLeak.toFixed(1)}MB increase)`);
      recommendations.push('Check for unreleased event listeners and animation cleanup');
    }

    if (data.memoryStats.peak > config.maxMemoryUsage) {
      issues.push(`Peak memory usage (${data.memoryStats.peak.toFixed(1)}MB) exceeds limit (${config.maxMemoryUsage}MB)`);
      recommendations.push('Optimize memory usage by reducing concurrent animations');
    }

    // Calculate overall pass/fail
    const passed = issues.length === 0;

    return {
      testName: config.testName,
      passed,
      duration: config.duration,
      metrics: {
        averageFps: data.frameMetrics.averageFps,
        minFps: data.frameMetrics.minFps,
        maxFps: data.frameMetrics.maxFps,
        droppedFrames: data.frameMetrics.droppedFrames,
        memoryUsage: {
          initial: data.initialMemory,
          peak: data.memoryStats.peak,
          final: data.memoryStats.current,
          leaked: memoryLeak
        },
        animationCount: data.memoryStats.animatingComponents
      },
      issues,
      recommendations,
      timestamp: Date.now()
    };
  }

  private generateBenchmark(results: PerformanceTestResult[]): PerformanceBenchmark {
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    
    // Calculate overall score (0-100)
    const fpsScores = results.map(r => Math.min(100, (r.metrics.averageFps / 60) * 100));
    const memoryScores = results.map(r => Math.max(0, 100 - (r.metrics.memoryUsage.leaked * 2)));
    const averageScore = (fpsScores.concat(memoryScores).reduce((sum, score) => sum + score, 0)) / (results.length * 2);

    // Collect critical issues
    const criticalIssues: string[] = [];
    results.forEach(result => {
      result.issues.forEach(issue => {
        if (issue.includes('Severe') || issue.includes('memory leak')) {
          criticalIssues.push(`${result.testName}: ${issue}`);
        }
      });
    });

    return {
      testResults: results,
      overallScore: Math.round(averageScore),
      criticalIssues,
      summary: {
        totalTests: results.length,
        passedTests,
        failedTests,
        averageScore: Math.round(averageScore)
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const performanceTester = new PerformanceTester();

/**
 * Predefined test configurations for common scenarios
 */
export const testConfigs: Record<string, PerformanceTestConfig> = {
  landingPageLoad: {
    testName: 'Landing Page Load Performance',
    duration: 5000,
    targetFps: 45,
    maxMemoryUsage: 50,
    animationSelectors: ['.hero-section', '.feature-cards', '.pricing-section'],
    interactions: [
      { type: 'scroll', selector: '.feature-cards', delay: 1000 },
      { type: 'scroll', selector: '.pricing-section', delay: 1000 }
    ]
  },

  heroAnimations: {
    testName: 'Hero Section Animations',
    duration: 3000,
    targetFps: 50,
    maxMemoryUsage: 30,
    animationSelectors: ['.hero-section', '.typewriter-text', '.floating-particles']
  },

  pricingInteractions: {
    testName: 'Pricing Section Interactions',
    duration: 4000,
    targetFps: 45,
    maxMemoryUsage: 35,
    animationSelectors: ['.pricing-card', '.billing-toggle'],
    interactions: [
      { type: 'hover', selector: '.pricing-card', delay: 500 },
      { type: 'click', selector: '.billing-toggle', delay: 1000 },
      { type: 'hover', selector: '.pricing-card:nth-child(2)', delay: 500 }
    ]
  },

  authFormAnimations: {
    testName: 'Authentication Form Animations',
    duration: 3000,
    targetFps: 50,
    maxMemoryUsage: 25,
    animationSelectors: ['.auth-form', '.form-field', '.loading-spinner']
  },

  mobileScrolling: {
    testName: 'Mobile Scrolling Performance',
    duration: 6000,
    targetFps: 30, // Lower target for mobile
    maxMemoryUsage: 40,
    animationSelectors: ['.scroll-trigger', '.parallax-effect'],
    interactions: [
      { type: 'scroll', selector: '.hero-section', delay: 1000 },
      { type: 'scroll', selector: '.feature-cards', delay: 1000 },
      { type: 'scroll', selector: '.testimonials', delay: 1000 },
      { type: 'scroll', selector: '.pricing-section', delay: 1000 }
    ]
  }
};

/**
 * React hook for running performance tests
 */
export function usePerformanceTesting() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [results, setResults] = React.useState<PerformanceTestResult[]>([]);

  const runTest = async (config: PerformanceTestConfig) => {
    setIsRunning(true);
    try {
      const result = await performanceTester.runTest(config);
      setResults(prev => [...prev, result]);
      return result;
    } finally {
      setIsRunning(false);
    }
  };

  const runTestSuite = async (configs: PerformanceTestConfig[]) => {
    setIsRunning(true);
    try {
      const benchmark = await performanceTester.runTestSuite(configs);
      setResults(benchmark.testResults);
      return benchmark;
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    performanceTester.clearResults();
  };

  return {
    isRunning,
    results,
    runTest,
    runTestSuite,
    clearResults
  };
}