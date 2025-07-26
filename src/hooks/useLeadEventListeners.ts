import { useEffect, useCallback } from 'react';

interface UseLeadEventListenersProps {
  onRefresh: () => void;
}

export function useLeadEventListeners({ onRefresh }: UseLeadEventListenersProps): void {
  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  useEffect(() => {
    window.addEventListener('leadDataRefresh', handleRefresh);
    
    return () => {
      window.removeEventListener('leadDataRefresh', handleRefresh);
    };
  }, [handleRefresh]);
}