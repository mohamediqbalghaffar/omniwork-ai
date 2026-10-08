import { useEffect } from 'react';
import { useAIStore } from '../store/aiStore';
import { ipcBridge } from '../services/ipc-bridge';

export function useBackgroundSync() {
  const { backgroundStatus, setBackgroundStatus } = useAIStore();

  useEffect(() => {
    const unsubscribe = ipcBridge.onAIStatus((status) => {
      setBackgroundStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, [setBackgroundStatus]);

  return { backgroundStatus };
}
