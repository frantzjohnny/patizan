import { useCallback } from 'react';

/**
 * Simple toast hook providing success and error notifications.
 * In a production app you would replace this with a proper UI toast library.
 */
export function useToast() {
  const success = useCallback((msg: string) => {
    // Using the browser's alert for demonstration; replace with UI toast.
    // eslint-disable-next-line no-alert
    alert(`✅ ${msg}`);
  }, []);

  const error = useCallback((msg: string) => {
    // eslint-disable-next-line no-alert
    alert(`🚨 ${msg}`);
  }, []);

  return { success, error } as const;
}
