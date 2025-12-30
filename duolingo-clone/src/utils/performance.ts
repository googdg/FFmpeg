/**
 * 性能优化工具集
 */

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 延迟加载图片
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  placeholder?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 设置占位符
    if (placeholder) {
      img.src = placeholder;
    }
    
    // 创建新的图片对象进行预加载
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      resolve();
    };
    
    imageLoader.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    imageLoader.src = src;
  });
}

// 虚拟滚动辅助函数
export function calculateVisibleItems(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  totalItems: number,
  overscan: number = 5
): { startIndex: number; endIndex: number; visibleItems: number } {
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    startIndex + visibleItems + overscan * 2
  );
  
  return { startIndex, endIndex, visibleItems };
}

// 内存使用监控
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
  return null;
}

// 性能标记和测量
export class PerformanceTracker {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  mark(name: string): void {
    const timestamp = performance.now();
    this.marks.set(name, timestamp);
    
    if (performance.mark) {
      performance.mark(name);
    }
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      throw new Error(`Start mark "${startMark}" not found`);
    }

    const endTime = endMark ? this.marks.get(endMark) : performance.now();
    if (endMark && !endTime) {
      throw new Error(`End mark "${endMark}" not found`);
    }

    const duration = (endTime as number) - startTime;
    this.measures.set(name, duration);

    if (performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (error) {
        // Fallback for browsers that don't support performance.measure
        console.warn('Performance.measure not supported:', error);
      }
    }

    return duration;
  }

  getMeasure(name: string): number | undefined {
    return this.measures.get(name);
  }

  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
    
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }
}

// 全局性能跟踪器实例
export const performanceTracker = new PerformanceTracker();

// 组件渲染性能监控
export function measureRenderTime(componentName: string) {
  return function <T extends React.ComponentType<any>>(Component: T): T {
    const WrappedComponent = React.forwardRef<any, React.ComponentProps<T>>(
      (props, ref) => {
        React.useEffect(() => {
          performanceTracker.mark(`${componentName}-render-start`);
          
          return () => {
            performanceTracker.mark(`${componentName}-render-end`);
            const renderTime = performanceTracker.measure(
              `${componentName}-render`,
              `${componentName}-render-start`,
              `${componentName}-render-end`
            );
            
            if (renderTime > 16) { // 超过一帧的时间
              console.warn(
                `Component ${componentName} render time: ${renderTime.toFixed(2)}ms`
              );
            }
          };
        });

        return React.createElement(Component, { ...props, ref });
      }
    );

    WrappedComponent.displayName = `withRenderTracking(${componentName})`;
    return WrappedComponent as T;
  };
}

// 资源预加载
export function preloadResource(
  url: string,
  type: 'script' | 'style' | 'image' | 'font' = 'script'
): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
    }
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload ${url}`));
    
    document.head.appendChild(link);
  });
}

// 代码分割辅助函数
export function createAsyncComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = React.lazy(importFunc);
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <React.Suspense fallback={fallback ? React.createElement(fallback) : null}>
      <LazyComponent {...props} ref={ref} />
    </React.Suspense>
  ));
}

// 批量状态更新
export function batchUpdates<T>(
  updates: Array<() => void>
): void {
  if ('unstable_batchedUpdates' in React) {
    (React as any).unstable_batchedUpdates(() => {
      updates.forEach(update => update());
    });
  } else {
    // Fallback: React 18+ 自动批处理
    updates.forEach(update => update());
  }
}

// Web Worker 辅助函数
export function createWorker(
  workerFunction: Function,
  dependencies: string[] = []
): Worker {
  const workerScript = `
    ${dependencies.join('\n')}
    
    self.onmessage = function(e) {
      const result = (${workerFunction.toString()})(e.data);
      self.postMessage(result);
    };
  `;
  
  const blob = new Blob([workerScript], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  
  return new Worker(workerUrl);
}

// 缓存管理
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: any, ttl: number = 300000): void { // 默认5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 全局缓存管理器实例
export const cacheManager = new CacheManager();

// 定期清理过期缓存
setInterval(() => {
  cacheManager.cleanup();
}, 60000); // 每分钟清理一次

// 网络状态监控
export function createNetworkMonitor(): {
  isOnline: boolean;
  connectionType: string;
  subscribe: (callback: (status: { isOnline: boolean; connectionType: string }) => void) => () => void;
} {
  let isOnline = navigator.onLine;
  let connectionType = 'unknown';
  
  // 获取连接类型
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    connectionType = connection.effectiveType || connection.type || 'unknown';
  }

  const listeners = new Set<(status: { isOnline: boolean; connectionType: string }) => void>();

  const updateStatus = () => {
    const newIsOnline = navigator.onLine;
    let newConnectionType = 'unknown';
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      newConnectionType = connection.effectiveType || connection.type || 'unknown';
    }

    if (newIsOnline !== isOnline || newConnectionType !== connectionType) {
      isOnline = newIsOnline;
      connectionType = newConnectionType;
      
      listeners.forEach(listener => {
        listener({ isOnline, connectionType });
      });
    }
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  
  if ('connection' in navigator) {
    (navigator as any).connection.addEventListener('change', updateStatus);
  }

  return {
    get isOnline() { return isOnline; },
    get connectionType() { return connectionType; },
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

// 导入 React（如果在模块中使用）
import React from 'react';