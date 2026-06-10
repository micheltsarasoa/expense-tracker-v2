import { config } from 'dotenv';
config({ path: '../../.env.local' });
config({ path: '../../.env' });

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../src/schema';
import { and, eq, gte } from 'drizzle-orm';

async function main() {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env['DATABASE_URL']! });
  const db = drizzle({ client: pool, schema });

  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, 'micheltsarasoa@gmail.com'),
  });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  const CUTOFF = '2026-01-01';

  const toDelete = await db
    .select({ id: schema.transactions.id, date: schema.transactions.transactionDate })
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.userId, user.id),
        gte(schema.transactions.transactionDate, CUTOFF),
      ),
    );

  console.log(`Will delete ${toDelete.length} transactions (date >= ${CUTOFF})`);

  const result = await db
    .delete(schema.transactions)
    .where(
      and(
        eq(schema.transactions.userId, user.id),
        gte(schema.transactions.transactionDate, CUTOFF),
      ),
    );

  console.log(`Deleted. DB is now clean for dates >= ${CUTOFF}.`);
  await pool.end();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
