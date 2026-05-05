import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@expense-tracker/types';
import { makeReq, makeCtx } from './_helpers';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ userId: 'user-123' }),
}));

vi.mock('@/app/api/v1/_services', () => ({
  labelService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { getAuthenticatedUser } from '@/lib/auth';
import { labelService } from '@/app/api/v1/_services';
import { GET, POST } from '../labels/route';
import { PUT, DELETE } from '../labels/[id]/route';

const BASE = 'http://localhost/api/v1/labels';

beforeEach(() => {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({ userId: 'user-123' });
});

describe('GET /labels', () => {
  it('returns 200 with label list on success', async () => {
    const mockList = [{ id: 'lbl-1', name: 'Important' }];
    vi.mocked(labelService.list).mockResolvedValue(mockList as never);

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
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('POST /labels', () => {
  it('returns 201 with created label on success', async () => {
    const payload = { name: 'Vacation' };
    const created = { id: 'lbl-2', ...payload };
    vi.mocked(labelService.create).mockResolvedValue(created as never);

    const res = await POST(makeReq('POST', BASE, payload), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(created);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await POST(makeReq('POST', BASE, { name: 'x' }), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeReq('POST', BASE, {}), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when color is not a valid hex', async () => {
    const res = await POST(makeReq('POST', BASE, { name: 'X', color: 'not-a-color' }), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /labels/:id', () => {
  it('returns 200 with updated label on success', async () => {
    const updated = { id: 'lbl-1', name: 'Updated' };
    vi.mocked(labelService.update).mockResolvedValue(updated as never);

    const res = await PUT(
      makeReq('PUT', `${BASE}/lbl-1`, { name: 'Updated' }),
      makeCtx({ id: 'lbl-1' }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(updated);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await PUT(makeReq('PUT', `${BASE}/lbl-1`, { name: 'x' }), makeCtx({ id: 'lbl-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when label not found', async () => {
    vi.mocked(labelService.update).mockRejectedValue(AppError.notFound());

    const res = await PUT(
      makeReq('PUT', `${BASE}/missing`, { name: 'x' }),
      makeCtx({ id: 'missing' }),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /labels/:id', () => {
  it('returns 200 with null data on success', async () => {
    vi.mocked(labelService.delete).mockResolvedValue(undefined as never);

    const res = await DELETE(makeReq('DELETE', `${BASE}/lbl-1`), makeCtx({ id: 'lbl-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeNull();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await DELETE(makeReq('DELETE', `${BASE}/lbl-1`), makeCtx({ id: 'lbl-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when label not found', async () => {
    vi.mocked(labelService.delete).mockRejectedValue(AppError.notFound());

    const res = await DELETE(makeReq('DELETE', `${BASE}/missing`), makeCtx({ id: 'missing' }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
