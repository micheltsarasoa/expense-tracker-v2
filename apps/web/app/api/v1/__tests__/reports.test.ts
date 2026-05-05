import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@expense-tracker/types';
import { makeReq, makeCtx } from './_helpers';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ userId: 'user-123' }),
}));

vi.mock('@/app/api/v1/_services', () => ({
  reportService: {
    balanceHistory: vi.fn(),
    budgetVsActual: vi.fn(),
    incomeVsExpenses: vi.fn(),
    spendingByCategory: vi.fn(),
  },
}));

import { getAuthenticatedUser } from '@/lib/auth';
import { reportService } from '@/app/api/v1/_services';
import { GET as BALANCE_HISTORY } from '../reports/balance-history/route';
import { GET as BUDGET_VS_ACTUAL } from '../reports/budget-vs-actual/route';
import { GET as INCOME_VS_EXPENSES } from '../reports/income-vs-expenses/route';
import { GET as SPENDING_BY_CATEGORY } from '../reports/spending-by-category/route';

const BASE = 'http://localhost/api/v1/reports';

beforeEach(() => {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({ userId: 'user-123' });
});

describe('GET /reports/balance-history', () => {
  it('returns 200 with balance history on success', async () => {
    const mockData = [{ month: '2024-01', balance: '1000.00' }];
    vi.mocked(reportService.balanceHistory).mockResolvedValue(mockData as never);

    const res = await BALANCE_HISTORY(makeReq('GET', `${BASE}/balance-history`), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockData);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await BALANCE_HISTORY(makeReq('GET', `${BASE}/balance-history`), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('GET /reports/budget-vs-actual', () => {
  it('returns 200 with budget vs actual data on success', async () => {
    const mockData = [{ budgetName: 'Food', budgeted: '500.00', actual: '420.00' }];
    vi.mocked(reportService.budgetVsActual).mockResolvedValue(mockData as never);

    const res = await BUDGET_VS_ACTUAL(makeReq('GET', `${BASE}/budget-vs-actual`), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockData);
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await BUDGET_VS_ACTUAL(makeReq('GET', `${BASE}/budget-vs-actual`), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('GET /reports/income-vs-expenses', () => {
  it('returns 200 with default months=6 when no query param', async () => {
    const mockData = [{ month: '2024-01', income: '3000.00', expenses: '1500.00' }];
    vi.mocked(reportService.incomeVsExpenses).mockResolvedValue(mockData as never);

    const res = await INCOME_VS_EXPENSES(makeReq('GET', `${BASE}/income-vs-expenses`), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(vi.mocked(reportService.incomeVsExpenses)).toHaveBeenCalledWith('user-123', 6);
  });

  it('uses provided months query param', async () => {
    vi.mocked(reportService.incomeVsExpenses).mockResolvedValue([] as never);

    await INCOME_VS_EXPENSES(
      makeReq('GET', `${BASE}/income-vs-expenses`, undefined, { months: '12' }),
      makeCtx(),
    );

    expect(vi.mocked(reportService.incomeVsExpenses)).toHaveBeenCalledWith('user-123', 12);
  });

  it('returns 400 when months exceeds maximum of 24', async () => {
    const res = await INCOME_VS_EXPENSES(
      makeReq('GET', `${BASE}/income-vs-expenses`, undefined, { months: '25' }),
      makeCtx(),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await INCOME_VS_EXPENSES(makeReq('GET', `${BASE}/income-vs-expenses`), makeCtx());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('GET /reports/spending-by-category', () => {
  it('returns 200 with spending data when from and to are provided', async () => {
    const mockData = [{ category: 'Food', total: '420.00' }];
    vi.mocked(reportService.spendingByCategory).mockResolvedValue(mockData as never);

    const res = await SPENDING_BY_CATEGORY(
      makeReq('GET', `${BASE}/spending-by-category`, undefined, {
        from: '2024-01-01',
        to: '2024-01-31',
      }),
      makeCtx(),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(vi.mocked(reportService.spendingByCategory)).toHaveBeenCalledWith(
      'user-123',
      '2024-01-01',
      '2024-01-31',
    );
  });

  it('returns 400 when from query param is missing', async () => {
    const res = await SPENDING_BY_CATEGORY(
      makeReq('GET', `${BASE}/spending-by-category`, undefined, { to: '2024-01-31' }),
      makeCtx(),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when to query param is missing', async () => {
    const res = await SPENDING_BY_CATEGORY(
      makeReq('GET', `${BASE}/spending-by-category`, undefined, { from: '2024-01-01' }),
      makeCtx(),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when date format is invalid', async () => {
    const res = await SPENDING_BY_CATEGORY(
      makeReq('GET', `${BASE}/spending-by-category`, undefined, {
        from: 'not-a-date',
        to: '2024-01-31',
      }),
      makeCtx(),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValue(AppError.unauthorized());

    const res = await SPENDING_BY_CATEGORY(
      makeReq('GET', `${BASE}/spending-by-category`, undefined, {
        from: '2024-01-01',
        to: '2024-01-31',
      }),
      makeCtx(),
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});
