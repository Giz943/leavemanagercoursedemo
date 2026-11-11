import { useEffect, useState } from 'react';
import type { HealthResponse } from '@leave/shared';
import { fetchHealth } from './api-client.ts';

type ViewState =
  { kind: 'loading' } | { kind: 'success'; health: HealthResponse } | { kind: 'error' };

export interface HealthPageProps {
  loadHealth?: () => Promise<HealthResponse>;
}

export function HealthPage({ loadHealth = fetchHealth }: HealthPageProps) {
  const [state, setState] = useState<ViewState>({ kind: 'loading' });

  useEffect(() => {
    let active = true;
    loadHealth().then(
      (health) => {
        if (active) setState({ kind: 'success', health });
      },
      () => {
        if (active) setState({ kind: 'error' });
      },
    );
    return () => {
      active = false;
    };
  }, [loadHealth]);

  return (
    <main>
      <h1>Uçuş Rezervasyon</h1>
      <div role="status">
        {state.kind === 'loading' && <p>Sistem durumu kontrol ediliyor…</p>}
        {state.kind === 'error' && <p>Sistem durumuna ulaşılamadı</p>}
        {state.kind === 'success' && (
          <>
            <p>
              {state.health.status === 'ok' ? 'Sistem çalışıyor' : 'Sistem durumuna ulaşılamadı'}
            </p>
            <p>
              {state.health.database === 'connected'
                ? 'Veritabanı: bağlı'
                : 'Veritabanı: bağlı değil'}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
