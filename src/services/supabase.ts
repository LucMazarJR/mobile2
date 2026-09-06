// O polyfill de URL precisa vir antes do supabase-js: o cliente usa a API
// global URL, que o Hermes (motor JS do React Native) não traz por padrão.
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const chaveAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// O app funciona 100% offline mesmo sem as credenciais preenchidas: nesse caso
// só a sincronização fica desligada, o SQLite continua normal.
export const supabaseConfigurado = Boolean(url && chaveAnon);

export const supabase =
  url && chaveAnon
    ? createClient(url, chaveAnon, {
        auth: {
          // Não há login no app, então o cliente não precisa guardar sessão
          // (é isso que dispensa o AsyncStorage como dependência).
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;
