import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import * as schema from './schema';

// The WebSocket Pool driver (unlike neon-http) supports interactive
// transactions — required by TransactionService for atomic balance updates.
// Node has no global WebSocket, so wire one up.
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env['DATABASE_URL']! });

export const db = drizzle({ client: pool, schema });

export type Database = typeof db;
