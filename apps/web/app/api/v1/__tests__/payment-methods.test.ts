import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@expense-tracker/types';
import { makeReq, makeCtx } from './_helpers';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ userId: 'user-123' }),
}));

vi.mock('@/app/api/v1/_services', () => ({
  paymentMethodService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivateOrDelete: vi.fn(),
  },
}));

import { getAuthenticatedUser } from '@/lib/auth';
import { paymentMethodService } from '@/app/api/v1/_services';
import { GET, POST } from '../payment-methods/route';
import { PUT, DELETE } from '../payment-methods/[id]/route';

const BASE = 'http://localhost/api/v1/payment-methods';

beforeEach(() => {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({ userId: 'user-123' });
});

describe('GET /payment-methods', () => {
  it('returns 200 with payment method list on success', async () => {
    const mockList = [{ id: 'pm-1', name: 'Cash', type: 'cash' }];
    vi.mocked(paymentMethodService.list).mockResolvedValue(mockList as never);

    const res = await GET(makeReq('GET', BASE), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockList);
  });

  it('passes includeInactive=true to service when query param provided', async () => {
    vi.mocked(paymentMethodService.list).mockResolvedValue([] as never);

    await GET(makeReq('GET', BASE, undefined, { includeInactive: 'true' }), makeCtx());

    expect(vi.mocked(paymentMethodService.list)).toHaveBeenCalledWith('user-123', true);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await GET(makeReq('GET', BASE), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('POST /payment-methods', () => {
  it('returns 201 with created payment method on success', async () => {
    const payload = { name: 'Visa', type: 'credit_card' };
    const created = { id: 'pm-2', ...payload };
    vi.mocked(paymentMethodService.create).mockResolvedValue(created as never);

    const res = await POST(makeReq('POST', BASE, payload), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(created);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await POST(makeReq('POST', BASE, { name: 'x', type: 'cash' }), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeReq('POST', BASE, {}), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when type is invalid', async () => {
    const res = await POST(makeReq('POST', BASE, { name: 'X', type: 'bitcoin' }), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /payment-methods/:id', () => {
  it('returns 200 with updated payment method on success', async () => {
    const updated = { id: 'pm-1', name: 'Updated Cash' };
    vi.mocked(paymentMethodService.update).mockResolvedValue(updated as never);

    const res = await PUT(
      makeReq('PUT', `${BASE}/pm-1`, { name: 'Updated Cash' }),
      makeCtx({ id: 'pm-1' }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(updated);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await PUT(makeReq('PUT', `${BASE}/pm-1`, { name: 'x' }), makeCtx({ id: 'pm-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when payment method not found', async () => {
    vi.mocked(paymentMethodService.update).mockRejectedValue(AppError.notFound());

    const res = await PUT(
      makeReq('PUT', `${BASE}/missing`, { name: 'x' }),
      makeCtx({ id: 'missing' }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /payment-methods/:id', () => {
  it('returns 200 with service result on success', async () => {
    const result = { id: 'pm-1', isActive: false };
    vi.mocked(paymentMethodService.deactivateOrDelete).mockResolvedValue(result as never);

    const res = await DELETE(makeReq('DELETE', `${BASE}/pm-1`), makeCtx({ id: 'pm-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(result);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await DELETE(makeReq('DELETE', `${BASE}/pm-1`), makeCtx({ id: 'pm-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when payment method not found', async () => {
    vi.mocked(paymentMethodService.deactivateOrDelete).mockRejectedValue(AppError.notFound());

    const res = await DELETE(makeReq('DELETE', `${BASE}/missing`), makeCtx({ id: 'missing' }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
