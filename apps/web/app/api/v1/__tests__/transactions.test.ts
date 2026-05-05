import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@expense-tracker/types';
import { makeReq, makeCtx } from './_helpers';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ userId: 'user-123' }),
}));

vi.mock('@/app/api/v1/_services', () => ({
  transactionService: {
    list: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleValidate: vi.fn(),
  },
}));

import { getAuthenticatedUser } from '@/lib/auth';
import { transactionService } from '@/app/api/v1/_services';
import { GET as LIST, POST as CREATE } from '../transactions/route';
import { GET, PUT, DELETE } from '../transactions/[id]/route';
import { PATCH } from '../transactions/[id]/validate/route';

const BASE = 'http://localhost/api/v1/transactions';

const PM_ID = '00000000-0000-0000-0000-000000000001';
const CAT_ID = '00000000-0000-0000-0000-000000000002';

const validCreateExpense = {
  type: 'expense',
  amount: '120.50',
  transactionDate: '2024-01-15',
  paymentMethodId: PM_ID,
  categoryId: CAT_ID,
};

beforeEach(() => {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({ userId: 'user-123' });
});

describe('GET /transactions', () => {
  it('returns 200 with transaction list and defaults on success', async () => {
    const mockList = { items: [], total: 0 };
    vi.mocked(transactionService.list).mockResolvedValue(mockList as never);

    const res = await LIST(makeReq('GET', BASE), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockList);
    // Default page/pageSize applied
    expect(vi.mocked(transactionService.list)).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({ page: 1, pageSize: 20 }),
    );
  });

  it('filters are forwarded to the service', async () => {
    vi.mocked(transactionService.list).mockResolvedValue({ items: [], total: 0 } as never);

    await LIST(
      makeReq('GET', BASE, undefined, { type: 'expense', page: '2', pageSize: '10' }),
      makeCtx(),
    );

    expect(vi.mocked(transactionService.list)).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({ type: 'expense', page: 2, pageSize: 10 }),
    );
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await LIST(makeReq('GET', BASE), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when type filter is invalid', async () => {
    const res = await LIST(makeReq('GET', BASE, undefined, { type: 'invalid' }), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /transactions', () => {
  it('returns 201 with created transaction on success', async () => {
    const created = { id: 'txn-1', ...validCreateExpense };
    vi.mocked(transactionService.create).mockResolvedValue(created as never);

    const res = await CREATE(makeReq('POST', BASE, validCreateExpense), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(created);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await CREATE(makeReq('POST', BASE, validCreateExpense), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await CREATE(makeReq('POST', BASE, {}), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when amount format is invalid', async () => {
    const payload = { ...validCreateExpense, amount: 'not-a-number' };
    const res = await CREATE(makeReq('POST', BASE, payload), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when expense is missing categoryId', async () => {
    const payload = {
      type: 'expense',
      amount: '100.00',
      transactionDate: '2024-01-01',
      paymentMethodId: PM_ID,
    };
    const res = await CREATE(makeReq('POST', BASE, payload), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when transfer source and destination accounts are the same', async () => {
    const payload = {
      type: 'transfer',
      amount: '100.00',
      transactionDate: '2024-01-01',
      paymentMethodId: PM_ID,
      toPaymentMethodId: PM_ID,
    };
    const res = await CREATE(makeReq('POST', BASE, payload), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /transactions/:id', () => {
  it('returns 200 with transaction on success', async () => {
    const txn = { id: 'txn-1', ...validCreateExpense };
    vi.mocked(transactionService.findById).mockResolvedValue(txn as never);

    const res = await GET(makeReq('GET', `${BASE}/txn-1`), makeCtx({ id: 'txn-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(txn);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await GET(makeReq('GET', `${BASE}/txn-1`), makeCtx({ id: 'txn-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when transaction not found', async () => {
    vi.mocked(transactionService.findById).mockRejectedValue(AppError.notFound());

    const res = await GET(makeReq('GET', `${BASE}/missing`), makeCtx({ id: 'missing' }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('PUT /transactions/:id', () => {
  it('returns 200 with updated transaction on success', async () => {
    const updated = { id: 'txn-1', amount: '200.00' };
    vi.mocked(transactionService.update).mockResolvedValue(updated as never);

    const res = await PUT(
      makeReq('PUT', `${BASE}/txn-1`, { amount: '200.00' }),
      makeCtx({ id: 'txn-1' }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(updated);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await PUT(
      makeReq('PUT', `${BASE}/txn-1`, { amount: '100.00' }),
      makeCtx({ id: 'txn-1' }),
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when body is empty object', async () => {
    const res = await PUT(makeReq('PUT', `${BASE}/txn-1`, {}), makeCtx({ id: 'txn-1' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when transaction not found', async () => {
    vi.mocked(transactionService.update).mockRejectedValue(AppError.notFound());

    const res = await PUT(
      makeReq('PUT', `${BASE}/missing`, { amount: '50.00' }),
      makeCtx({ id: 'missing' }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /transactions/:id', () => {
  it('returns 200 with null data on success', async () => {
    vi.mocked(transactionService.delete).mockResolvedValue(undefined as never);

    const res = await DELETE(makeReq('DELETE', `${BASE}/txn-1`), makeCtx({ id: 'txn-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeNull();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await DELETE(makeReq('DELETE', `${BASE}/txn-1`), makeCtx({ id: 'txn-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when transaction not found', async () => {
    vi.mocked(transactionService.delete).mockRejectedValue(AppError.notFound());

    const res = await DELETE(makeReq('DELETE', `${BASE}/missing`), makeCtx({ id: 'missing' }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('PATCH /transactions/:id/validate', () => {
  it('returns 200 with toggled transaction on success', async () => {
    const toggled = { id: 'txn-1', isValidated: true };
    vi.mocked(transactionService.toggleValidate).mockResolvedValue(toggled as never);

    const res = await PATCH(makeReq('PATCH', `${BASE}/txn-1/validate`), makeCtx({ id: 'txn-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(toggled);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await PATCH(makeReq('PATCH', `${BASE}/txn-1/validate`), makeCtx({ id: 'txn-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when transaction not found', async () => {
    vi.mocked(transactionService.toggleValidate).mockRejectedValue(AppError.notFound());

    const res = await PATCH(
      makeReq('PATCH', `${BASE}/missing/validate`),
      makeCtx({ id: 'missing' }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
