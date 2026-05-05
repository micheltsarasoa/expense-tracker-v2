import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@expense-tracker/types';
import { makeReq, makeCtx } from './_helpers';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ userId: 'user-123' }),
}));

vi.mock('@/app/api/v1/_services', () => ({
  categoryService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Imports must come AFTER vi.mock declarations
import { getAuthenticatedUser } from '@/lib/auth';
import { categoryService } from '@/app/api/v1/_services';
import { GET, POST } from '../categories/route';
import { PUT, DELETE } from '../categories/[id]/route';

const BASE = 'http://localhost/api/v1/categories';

beforeEach(() => {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({ userId: 'user-123' });
});

describe('GET /categories', () => {
  it('returns 200 with category list on success', async () => {
    const mockList = [{ id: 'cat-1', name: 'Food', type: 'expense' }];
    vi.mocked(categoryService.list).mockResolvedValue(mockList as never);

    const res = await GET(makeReq('GET', BASE), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockList);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await GET(makeReq('GET', BASE), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('POST /categories', () => {
  it('returns 201 with created category on success', async () => {
    const payload = { name: 'Transport', type: 'expense' };
    const created = { id: 'cat-2', ...payload };
    vi.mocked(categoryService.create).mockResolvedValue(created as never);

    const res = await POST(makeReq('POST', BASE, payload), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(created);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await POST(makeReq('POST', BASE, { name: 'x', type: 'expense' }), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when body is missing required fields', async () => {
    const res = await POST(makeReq('POST', BASE, {}), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when type is invalid', async () => {
    const res = await POST(makeReq('POST', BASE, { name: 'X', type: 'transfer' }), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /categories/:id', () => {
  it('returns 200 with updated category on success', async () => {
    const updated = { id: 'cat-1', name: 'Updated', type: 'expense' };
    vi.mocked(categoryService.update).mockResolvedValue(updated as never);

    const res = await PUT(
      makeReq('PUT', `${BASE}/cat-1`, { name: 'Updated' }),
      makeCtx({ id: 'cat-1' }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(updated);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await PUT(makeReq('PUT', `${BASE}/cat-1`, { name: 'x' }), makeCtx({ id: 'cat-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when category not found', async () => {
    vi.mocked(categoryService.update).mockRejectedValue(AppError.notFound());

    const res = await PUT(
      makeReq('PUT', `${BASE}/missing`, { name: 'x' }),
      makeCtx({ id: 'missing' }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /categories/:id', () => {
  it('returns 200 with null data on success', async () => {
    vi.mocked(categoryService.delete).mockResolvedValue(undefined as never);

    const res = await DELETE(makeReq('DELETE', `${BASE}/cat-1`), makeCtx({ id: 'cat-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeNull();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await DELETE(makeReq('DELETE', `${BASE}/cat-1`), makeCtx({ id: 'cat-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when category not found', async () => {
    vi.mocked(categoryService.delete).mockRejectedValue(AppError.notFound());

    const res = await DELETE(makeReq('DELETE', `${BASE}/missing`), makeCtx({ id: 'missing' }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
