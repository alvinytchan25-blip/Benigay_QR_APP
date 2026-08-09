import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearHistory,
  deleteScan,
  getScans,
  saveScan,
  type ScanRecord,
} from './history';

type HistoryContextValue = {
  scans: ScanRecord[];
  loading: boolean;
  addScan: (content: string) => Promise<ScanRecord[]>;
  removeScan: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setScans(await getScans());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addScan = useCallback(async (content: string) => {
    const next = await saveScan(content);
    setScans(next);
    return next;
  }, []);

  const removeScan = useCallback(async (id: string) => {
    const next = await deleteScan(id);
    setScans(next);
  }, []);

  const clearAll = useCallback(async () => {
    await clearHistory();
    setScans([]);
  }, []);

  const value = useMemo(
    () => ({ scans, loading, addScan, removeScan, clearAll, refresh }),
    [scans, loading, addScan, removeScan, clearAll, refresh],
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return ctx;
}