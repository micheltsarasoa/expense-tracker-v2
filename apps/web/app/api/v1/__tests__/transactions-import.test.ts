import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@expense-tracker/types';
import { makeFormReq, makeCtx } from './_helpers';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ userId: 'user-123' }),
}));

vi.mock('@/app/api/v1/_services', () => ({
  importService: {
    validate: vi.fn(),
    commit: vi.fn(),
  },
}));

import { getAuthenticatedUser } from '@/lib/auth';
import { importService } from '@/app/api/v1/_services';
import { GET as TEMPLATE } from '../transactions/import/template/route';
import { POST as VALIDATE } from '../transactions/import/validate/route';
import { POST as COMMIT } from '../transactions/import/route';

const BASE = 'http://localhost/api/v1/transactions/import';

const CSV_CONTENT =
  'date;type;amount;account;category;toAccount;label;description\n2024-01-01;expense;100.00;Cash;Food;;Lunch;';

function makeFileFormData(
  filename = 'import.csv',
  type = 'text/csv',
  content = CSV_CONTENT,
): FormData {
  const file = new File([content], filename, { type });
  const fd = new FormData();
  fd.append('file', file);
  return fd;
}

beforeEach(() => {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({ userId: 'user-123' });
});

describe('GET /transactions/import/template', () => {
  it('returns 200 with CSV content-type and correct headers', async () => {
    const res = await TEMPLATE();

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/csv');
    expect(res.headers.get('Content-Disposition')).toBe(
      'attachment; filename="import-template.csv"',
    );
  });

  it('returns the CSV header row in the body', async () => {
    const res = await TEMPLATE();
    const text = await res.text();

    expect(text).toContain('date;type;amount;account;category;toAccount;label;description');
  });
});

describe('POST /transactions/import/validate', () => {
  it('returns 200 with validation result on success', async () => {
    const mockResult = { valid: 5, invalid: 1, rows: [] };
    vi.mocked(importService.validate).mockResolvedValue(mockResult as never);

    const res = await VALIDATE(
      makeFormReq('POST', `${BASE}/validate`, makeFileFormData()),
      makeCtx(),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockResult);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await VALIDATE(
      makeFormReq('POST', `${BASE}/validate`, makeFileFormData()),
      makeCtx(),
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when no file field is provided in FormData', async () => {
    const emptyFd = new FormData();
    const res = await VALIDATE(makeFormReq('POST', `${BASE}/validate`, emptyFd), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when file field is a plain string not a File', async () => {
    const fd = new FormData();
    fd.append('file', 'not-a-file');
    const res = await VALIDATE(makeFormReq('POST', `${BASE}/validate`, fd), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /transactions/import', () => {
  it('returns 201 with import result on success', async () => {
    const mockResult = { imported: 5, skipped: 0 };
    vi.mocked(importService.commit).mockResolvedValue(mockResult as never);

    const res = await COMMIT(makeFormReq('POST', BASE, makeFileFormData()), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockResult);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await COMMIT(makeFormReq('POST', BASE, makeFileFormData()), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when no file field is provided in FormData', async () => {
    const emptyFd = new FormData();
    const res = await COMMIT(makeFormReq('POST', BASE, emptyFd), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when file field is a plain string not a File', async () => {
    const fd = new FormData();
    fd.append('file', 'not-a-file');
    const res = await COMMIT(makeFormReq('POST', BASE, fd), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
