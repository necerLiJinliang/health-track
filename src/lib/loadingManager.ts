// src/lib/loadingManager.ts
import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingActions {
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
}

/**
 * 通用加载状态管理Hook
 * @returns 加载状态和操作函数
 */
export const useLoadingManager = (): [LoadingState, LoadingActions] => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  
  // 使用useRef来保持对最新loadingStates的引用
  const loadingStatesRef = useRef<LoadingState>(loadingStates);
  
  // 当loadingStates变化时，更新ref
  useEffect(() => {
    loadingStatesRef.current = loadingStates;
  }, [loadingStates]);

  /**
   * 开始加载
   * @param key 唯一标识符
   */
  const startLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, []);

  /**
   * 停止加载
   * @param key 唯一标识符
   */
  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }, []);

  /**
   * 检查是否正在加载
   * @param key 唯一标识符
   * @returns 是否正在加载
   */
  const isLoading = useCallback((key: string) => {
    // 从ref中获取最新的loadingStates，避免依赖问题
    return !!loadingStatesRef.current[key];
  }, []);

  return [
    loadingStates,
    {
      startLoading,
      stopLoading,
      isLoading
    }
  ];
};

export default useLoadingManager;