import pino from 'pino';

// Do NOT set `transport` in production — Vercel captures stdout as structured JSON.
export const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
});
