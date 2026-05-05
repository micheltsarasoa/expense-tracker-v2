import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@expense-tracker/types';
import { makeReq, makeCtx } from './_helpers';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ userId: 'user-123' }),
}));

vi.mock('@/app/api/v1/_services', () => ({
  budgetService: {
    list: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    duplicate: vi.fn(),
  },
}));

import { getAuthenticatedUser } from '@/lib/auth';
import { budgetService } from '@/app/api/v1/_services';
import { GET as LIST, POST as CREATE } from '../budgets/route';
import { GET, PUT, DELETE } from '../budgets/[id]/route';
import { POST as DUPLICATE } from '../budgets/[id]/duplicate/route';

const BASE = 'http://localhost/api/v1/budgets';

beforeEach(() => {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({ userId: 'user-123' });
});

// Valid create payload
const validCreate = {
  name: 'Monthly Food',
  amount: '500.00',
  startDate: '2024-01-01',
};

describe('GET /budgets', () => {
  it('returns 200 with budget list on success', async () => {
    const mockList = [{ id: 'bgt-1', name: 'Monthly Food' }];
    vi.mocked(budgetService.list).mockResolvedValue(mockList as never);

    const res = await LIST(makeReq('GET', BASE), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockList);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await LIST(makeReq('GET', BASE), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('POST /budgets', () => {
  it('returns 201 with created budget on success', async () => {
    const created = { id: 'bgt-2', ...validCreate };
    vi.mocked(budgetService.create).mockResolvedValue(created as never);

    const res = await CREATE(makeReq('POST', BASE, validCreate), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(created);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await CREATE(makeReq('POST', BASE, validCreate), makeCtx());
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

  it('returns 400 when endDate is before startDate', async () => {
    const payload = { ...validCreate, endDate: '2023-12-31' };
    const res = await CREATE(makeReq('POST', BASE, payload), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /budgets/:id', () => {
  it('returns 200 with budget on success', async () => {
    const budget = { id: 'bgt-1', name: 'Monthly Food' };
    vi.mocked(budgetService.findById).mockResolvedValue(budget as never);

    const res = await GET(makeReq('GET', `${BASE}/bgt-1`), makeCtx({ id: 'bgt-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(budget);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await GET(makeReq('GET', `${BASE}/bgt-1`), makeCtx({ id: 'bgt-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when budget not found', async () => {
    vi.mocked(budgetService.findById).mockRejectedValue(AppError.notFound());

    const res = await GET(makeReq('GET', `${BASE}/missing`), makeCtx({ id: 'missing' }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('PUT /budgets/:id', () => {
  it('returns 200 with updated budget on success', async () => {
    const updated = { id: 'bgt-1', name: 'Updated' };
    vi.mocked(budgetService.update).mockResolvedValue(updated as never);

    const res = await PUT(
      makeReq('PUT', `${BASE}/bgt-1`, { name: 'Updated' }),
      makeCtx({ id: 'bgt-1' }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(updated);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await PUT(makeReq('PUT', `${BASE}/bgt-1`, { name: 'x' }), makeCtx({ id: 'bgt-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when budget not found', async () => {
    vi.mocked(budgetService.update).mockRejectedValue(AppError.notFound());

    const res = await PUT(
      makeReq('PUT', `${BASE}/missing`, { name: 'x' }),
      makeCtx({ id: 'missing' }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /budgets/:id', () => {
  it('returns 200 with null data on success', async () => {
    vi.mocked(budgetService.delete).mockResolvedValue(undefined as never);

    const res = await DELETE(makeReq('DELETE', `${BASE}/bgt-1`), makeCtx({ id: 'bgt-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeNull();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await DELETE(makeReq('DELETE', `${BASE}/bgt-1`), makeCtx({ id: 'bgt-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when budget not found', async () => {
    vi.mocked(budgetService.delete).mockRejectedValue(AppError.notFound());

    const res = await DELETE(makeReq('DELETE', `${BASE}/missing`), makeCtx({ id: 'missing' }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /budgets/:id/duplicate', () => {
  it('returns 201 with duplicated budget on success', async () => {
    const duplicated = { id: 'bgt-3', name: 'Monthly Food (copy)' };
    vi.mocked(budgetService.duplicate).mockResolvedValue(duplicated as never);

    const payload = { startDate: '2024-02-01' };
    const res = await DUPLICATE(
      makeReq('POST', `${BASE}/bgt-1/duplicate`, payload),
      makeCtx({ id: 'bgt-1' }),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(duplicated);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await DUPLICATE(
      makeReq('POST', `${BASE}/bgt-1/duplicate`, { startDate: '2024-02-01' }),
      makeCtx({ id: 'bgt-1' }),
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when startDate is missing', async () => {
    const res = await DUPLICATE(
      makeReq('POST', `${BASE}/bgt-1/duplicate`, {}),
      makeCtx({ id: 'bgt-1' }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when budget not found', async () => {
    vi.mocked(budgetService.duplicate).mockRejectedValue(AppError.notFound());

    const res = await DUPLICATE(
      makeReq('POST', `${BASE}/missing/duplicate`, { startDate: '2024-02-01' }),
      makeCtx({ id: 'missing' }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
