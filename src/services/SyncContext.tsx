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

import { contarPendentes, sincronizar, type ResultadoSync } from '@/services/sync';
import { supabaseConfigurado } from '@/services/supabase';

type ValorSync = {
  pendentes: number;
  sincronizando: boolean;
  ultimoErro: string | null;
  ultimoEnvio: Date | null;
  configurado: boolean;
  /**
   * Muda a cada envio bem-sucedido. As telas observam esse número para
   * recarregar os dados: depois do envio a coluna synced muda no banco, e sem
   * reler as linhas os cartões continuariam exibindo "não sincronizado".
   */
  revisao: number;
  sincronizarAgora: () => Promise<ResultadoSync | null>;
  atualizarPendentes: () => Promise<void>;
};

const SyncContext = createContext<ValorSync | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [pendentes, setPendentes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimoErro, setUltimoErro] = useState<string | null>(null);
  const [ultimoEnvio, setUltimoEnvio] = useState<Date | null>(null);
  const [revisao, setRevisao] = useState(0);

  // Evita que dois gatilhos (ex.: rede voltou + app abriu) disparem
  // sincronizações simultâneas e enviem a mesma linha duas vezes.
  const emAndamento = useRef(false);

  const atualizarPendentes = useCallback(async () => {
    try {
      setPendentes(await contarPendentes(db));
    } catch {
      // Se o banco ainda não estiver pronto, o próximo gatilho recalcula.
    }
  }, [db]);

  const sincronizarAgora = useCallback(async () => {
    if (emAndamento.current) return null;

    emAndamento.current = true;
    setSincronizando(true);

    const resultado = await sincronizar(db);

    if (resultado.ok) {
      setUltimoErro(null);
      if (resultado.enviadas > 0) {
        setUltimoEnvio(new Date());
        setRevisao((atual) => atual + 1);
      }
    } else if (resultado.motivo === 'falha') {
      setUltimoErro(resultado.erro);
    }

    await atualizarPendentes();
    setSincronizando(false);
    emAndamento.current = false;

    return resultado;
  }, [db, atualizarPendentes]);

  useEffect(() => {
    atualizarPendentes();

    // Gatilho 1: a conexão voltou.
    const removerNetInfo = NetInfo.addEventListener((estado) => {
      if (estado.isConnected) sincronizarAgora();
    });

    // Gatilho 2: o app voltou para o primeiro plano.
    const inscricaoAppState = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') sincronizarAgora();
    });

    return () => {
      removerNetInfo();
      inscricaoAppState.remove();
    };
  }, [atualizarPendentes, sincronizarAgora]);

  return (
    <SyncContext.Provider
      value={{
        pendentes,
        sincronizando,
        ultimoErro,
        ultimoEnvio,
        configurado: supabaseConfigurado,
        revisao,
        sincronizarAgora,
        atualizarPendentes,
      }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync(): ValorSync {
  const contexto = useContext(SyncContext);
  if (!contexto) throw new Error('useSync precisa estar dentro de <SyncProvider>');
  return contexto;
}
