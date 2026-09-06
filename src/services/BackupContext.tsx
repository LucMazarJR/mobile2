import NetInfo from '@react-native-community/netinfo';
import { useSQLiteContext } from 'expo-sqlite';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { isSupabaseConfigured } from '@/services/supabase';
import {
  countPending,
  downloadFromCloud,
  totalPending,
  uploadPending,
  type PendingCounts,
  type UploadResult,
} from '@/services/sync';

export type BackupState = 'disabled' | 'uploading' | 'pending' | 'offline' | 'failed' | 'saved';

type BackupValue = {
  state: BackupState;
  pending: PendingCounts;
  pendingTotal: number;
  lastUpload: Date | null;
  /** Raw library text. Never rendered outside the About screen. */
  lastErrorDetail: string | null;
  uploadNow: () => Promise<UploadResult | null>;
  fetchFromCloud: () => Promise<number>;
  refreshPending: () => Promise<void>;
  /** Bumps on every successful upload so screens reload and badges clear. */
  revision: number;
};

const EMPTY: PendingCounts = { equipment: 0, maintenance: 0 };

const BackupContext = createContext<BackupValue | null>(null);

export function BackupProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [pending, setPending] = useState<PendingCounts>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState<'offline' | 'failed' | null>(null);
  const [lastErrorDetail, setLastErrorDetail] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<Date | null>(null);
  const [revision, setRevision] = useState(0);

  // Stops two triggers (network back + app foregrounded) from uploading the
  // same rows twice.
  const running = useRef(false);

  const refreshPending = useCallback(async () => {
    try {
      setPending(await countPending(db));
    } catch {
      // The next trigger recalculates.
    }
  }, [db]);

  const uploadNow = useCallback(async () => {
    if (running.current) return null;

    running.current = true;
    setUploading(true);

    const result = await uploadPending(db);

    if (result.ok) {
      setProblem(null);
      if (result.uploaded > 0) {
        setLastUpload(new Date());
        setRevision((current) => current + 1);
      }
    } else if (result.reason === 'offline') {
      setProblem('offline');
    } else if (result.reason === 'failed') {
      setProblem('failed');
      setLastErrorDetail(result.detail);
      console.warn('[cloud copy] upload failed:', result.detail);
    }

    await refreshPending();
    setUploading(false);
    running.current = false;

    return result;
  }, [db, refreshPending]);

  const fetchFromCloud = useCallback(async () => {
    try {
      const downloaded = await downloadFromCloud(db);
      if (downloaded > 0) setRevision((current) => current + 1);
      await refreshPending();
      return downloaded;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setLastErrorDetail(detail);
      console.warn('[cloud copy] download failed:', detail);
      return 0;
    }
  }, [db, refreshPending]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      await refreshPending();
      if (cancelled) return;

      // A phone that has never held data pulls the cloud copy on first open —
      // this is what makes "I changed phones" work. It runs after the upload
      // path and can never affect it.
      try {
        const row = await db.getFirstAsync<{ total: number }>(
          'SELECT COUNT(*) AS total FROM equipment'
        );
        if (!cancelled && (row?.total ?? 0) === 0) await fetchFromCloud();
      } catch {
        // Nothing to restore; the app works normally.
      }
    }

    start();

    const stopNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected) uploadNow();
    });

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') uploadNow();
    });

    return () => {
      cancelled = true;
      stopNetInfo();
      appStateSub.remove();
    };
  }, [db, refreshPending, uploadNow, fetchFromCloud]);

  const pendingTotal = totalPending(pending);

  let state: BackupState = 'saved';
  if (!isSupabaseConfigured) state = 'disabled';
  else if (uploading) state = 'uploading';
  else if (problem === 'offline' && pendingTotal > 0) state = 'offline';
  else if (problem === 'failed' && pendingTotal > 0) state = 'failed';
  else if (pendingTotal > 0) state = 'pending';

  return (
    <BackupContext.Provider
      value={{
        state,
        pending,
        pendingTotal,
        lastUpload,
        lastErrorDetail,
        uploadNow,
        fetchFromCloud,
        refreshPending,
        revision,
      }}>
      {children}
    </BackupContext.Provider>
  );
}

export function useBackup(): BackupValue {
  const context = useContext(BackupContext);
  if (!context) throw new Error('useBackup must be used inside <BackupProvider>');
  return context;
}
