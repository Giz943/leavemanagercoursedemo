import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { HealthResponse } from '@leave/shared';
import { HealthPage } from './health-page.tsx';
import { fetchHealth } from './api-client.ts';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('HealthPage', () => {
  it('shows checking status while loading', () => {
    const pending = new Promise<HealthResponse>(() => {});

    render(<HealthPage loadHealth={() => pending} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Uçuş Rezervasyon' })).toBeDefined();
    expect(screen.getByRole('status').textContent).toBe('Sistem durumu kontrol ediliyor…');
  });

  it('shows running and database connected on success', async () => {
    render(
      <HealthPage loadHealth={() => Promise.resolve({ status: 'ok', database: 'connected' })} />,
    );

    expect(await screen.findByText('Sistem çalışıyor')).toBeDefined();
    expect(screen.getByText('Veritabanı: bağlı')).toBeDefined();
    expect(screen.getByRole('status').textContent).toContain('Sistem çalışıyor');
  });

  it('shows unreachable message on failure', async () => {
    render(<HealthPage loadHealth={() => Promise.reject(new TypeError('Failed to fetch'))} />);

    expect(await screen.findByText('Sistem durumuna ulaşılamadı')).toBeDefined();
    expect(screen.queryByText('Sistem çalışıyor')).toBeNull();
  });
});

describe('fetchHealth', () => {
  it('returns the parsed health response on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json({ status: 'ok', database: 'connected' }))),
    );

    await expect(fetchHealth()).resolves.toEqual({ status: 'ok', database: 'connected' });
  });

  it('rejects on an unsuccessful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          Response.json({ status: 'unavailable', database: 'disconnected' }, { status: 503 }),
        ),
      ),
    );

    await expect(fetchHealth()).rejects.toThrow();
  });

  it('rejects on a response that breaks the shared contract', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json({ status: 'maybe' }))),
    );

    await expect(fetchHealth()).rejects.toThrow();
  });
});
