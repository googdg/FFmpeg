import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { debounce, throttle, performanceTracker, cacheManager } from '../utils/performance';

/**
 * 防抖 Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖回调 Hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(
    () => debounce((...args: Parameters<T>) => callbackRef.current(...args), delay),
    [delay, ...deps]
  ) as T;
}

/**
 * 节流回调 Hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(
    () => throttle((...args: Parameters<T>) => callbackRef.current(...args), limit),
    [limit, ...deps]
  ) as T;
}

/**
 * 虚拟滚动 Hook
 */
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleCount + overscan * 2
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
  };
}

/**
 * 懒加载 Hook
 */
export function useLazyLoad(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, hasLoaded, options]);

  return isVisible;
}

/**
 * 性能监控 Hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    performanceTracker.mark(`${componentName}-mount`);

    return () => {
      const unmountTime = performance.now();
      const mountDuration = unmountTime - mountTimeRef.current;
      
      performanceTracker.mark(`${componentName}-unmount`);
      performanceTracker.measure(
        `${componentName}-lifecycle`,
        `${componentName}-mount`,
        `${componentName}-unmount`
      );

      console.log(`Component ${componentName} lifecycle: ${mountDuration.toFixed(2)}ms`);
      console.log(`Component ${componentName} render count: ${renderCountRef.current}`);
    };
  }, [componentName]);

  useEffect(() => {
    renderCountRef.current += 1;
    
    if (renderCountRef.current > 10) {
      console.warn(`Component ${componentName} has rendered ${renderCountRef.current} times`);
    }
  });

  return {
    renderCount: renderCountRef.current,
    markRender: useCallback((phase: string) => {
      performanceTracker.mark(`${componentName}-${phase}`);
    }, [componentName]),
  };
}

/**
 * 内存使用监控 Hook
 */
export function useMemoryMonitor(interval: number = 5000) {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        });
      }
    };

    updateMemoryUsage();
    const intervalId = setInterval(updateMemoryUsage, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryUsage;
}

/**
 * 缓存 Hook
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  ttl: number = 300000 // 5分钟
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(() => cacheManager.get(key));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetcher();
      
      setData(result);
      cacheManager.set(key, result, ttl);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, [data, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * 网络状态 Hook
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
      }
    };

    updateConnectionType();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateConnectionType);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateConnectionType);
      }
    };
  }, []);

  return { isOnline, connectionType };
}

/**
 * 图片懒加载 Hook
 */
export function useImageLazyLoad(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const isVisible = useLazyLoad(imgRef);

  useEffect(() => {
    if (!isVisible || isLoaded) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setError(null);
    };
    
    img.onerror = () => {
      setError(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  }, [isVisible, src, isLoaded]);

  return {
    ref: imgRef,
    src: imageSrc,
    isLoaded,
    error,
  };
}

/**
 * 批量状态更新 Hook
 */
export function useBatchedUpdates() {
  const updatesRef = useRef<Array<() => void>>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((update: () => void) => {
    updatesRef.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const updates = updatesRef.current;
      updatesRef.current = [];

      // 在 React 18+ 中，状态更新会自动批处理
      // 对于旧版本，可以使用 unstable_batchedUpdates
      if ('unstable_batchedUpdates' in React) {
        (React as any).unstable_batchedUpdates(() => {
          updates.forEach(update => update());
        });
      } else {
        updates.forEach(update => update());
      }
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
}

/**
 * 组件大小监控 Hook
 */
export function useElementSize<T extends HTMLElement>(): [
  React.RefObject<T>,
  { width: number; height: number }
] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [ref, size];
}

/**
 * 滚动位置 Hook
 */
export function useScrollPosition(element?: React.RefObject<HTMLElement>) {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const targetElement = element?.current || window;
    
    const updateScrollPosition = throttle(() => {
      if (targetElement === window) {
        setScrollPosition({
          x: window.scrollX,
          y: window.scrollY,
        });
      } else {
        const el = targetElement as HTMLElement;
        setScrollPosition({
          x: el.scrollLeft,
          y: el.scrollTop,
        });
      }
    }, 16); // 60fps

    targetElement.addEventListener('scroll', updateScrollPosition);

    return () => {
      targetElement.removeEventListener('scroll', updateScrollPosition);
    };
  }, [element]);

  return scrollPosition;
}

// 导入 React
import React from 'react';