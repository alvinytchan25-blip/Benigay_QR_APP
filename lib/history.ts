import AsyncStorage from '@react-native-async-storage/async-storage';

export type ScanType = 'url' | 'text';

export type ScanRecord = {
  id: string;
  content: string;
  type: ScanType;
  timestamp: number;
};

const STORAGE_KEY = 'ed_qr_history';
const MAX_ENTRIES = 100;

export function isUrl(content: string): boolean {
  return /^(https?:\/\/|www\.).+/i.test(content.trim());
}

export function classifyContent(content: string): ScanType {
  return isUrl(content) ? 'url' : 'text';
}

export async function getScans(): Promise<ScanRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScanRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveScan(content: string): Promise<ScanRecord[]> {
  const trimmed = content.trim().slice(0, 2000);
  const record: ScanRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content: trimmed,
    type: classifyContent(trimmed),
    timestamp: Date.now(),
  };
  const scans = await getScans();
  const next = [record, ...scans].slice(0, MAX_ENTRIES);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // keep in-memory result even if persist fails
  }
  return next;
}

export async function deleteScan(id: string): Promise<ScanRecord[]> {
  const scans = await getScans();
  const next = scans.filter((s) => s.id !== id);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}