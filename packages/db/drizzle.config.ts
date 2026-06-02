import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local first (takes precedence if present), then fall back to .env.
// dotenv does not override already-set vars, so .env.local wins when both exist.
config({ path: '../../.env.local' });
config({ path: '../../.env' });

export default defineConfig({
  schema: './src/schema',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL']!,
  },
});
