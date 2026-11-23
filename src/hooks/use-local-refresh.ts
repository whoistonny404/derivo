import { useCallback, useState } from 'react';

export function useLocalRefresh() {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 350));
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { refreshing, refresh };
}
