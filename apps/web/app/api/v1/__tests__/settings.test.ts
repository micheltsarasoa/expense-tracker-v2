import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@expense-tracker/types';
import { makeReq, makeCtx } from './_helpers';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ userId: 'user-123' }),
}));

vi.mock('@/app/api/v1/_services', () => ({
  settingsService: {
    getByUserId: vi.fn(),
    upsert: vi.fn(),
  },
}));

import { getAuthenticatedUser } from '@/lib/auth';
import { settingsService } from '@/app/api/v1/_services';
import { GET, PUT } from '../settings/route';

const BASE = 'http://localhost/api/v1/settings';

beforeEach(() => {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({ userId: 'user-123' });
});

describe('GET /settings', () => {
  it('returns 200 with settings on success', async () => {
    const mockSettings = { currencySymbol: '$', currencyPosition: 'before' };
    vi.mocked(settingsService.getByUserId).mockResolvedValue(mockSettings as never);

    const res = await GET(makeReq('GET', BASE), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockSettings);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await GET(makeReq('GET', BASE), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('PUT /settings', () => {
  it('returns 200 with updated settings on success', async () => {
    const payload = { currencySymbol: '€', currencyPosition: 'after' };
    const updated = { id: 'settings-1', ...payload };
    vi.mocked(settingsService.upsert).mockResolvedValue(updated as never);

    const res = await PUT(makeReq('PUT', BASE, payload), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(updated);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await PUT(makeReq('PUT', BASE, { currencySymbol: '€' }), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when decimal and thousand separators are the same', async () => {
    const payload = { decimalSeparator: '.', thousandSeparator: '.' };
    const res = await PUT(makeReq('PUT', BASE, payload), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when timeFormat is invalid', async () => {
    const res = await PUT(makeReq('PUT', BASE, { timeFormat: '13h' }), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
