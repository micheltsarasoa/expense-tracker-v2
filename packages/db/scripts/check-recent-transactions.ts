import { config } from 'dotenv';
config({ path: '../../.env.local' });
config({ path: '../../.env' });

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../src/schema';
import { eq, gte } from 'drizzle-orm';

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

  const [txRows, accountRows] = await Promise.all([
    db
      .select({
        id: schema.transactions.id,
        type: schema.transactions.type,
        amount: schema.transactions.amount,
        transactionDate: schema.transactions.transactionDate,
        paymentMethodId: schema.transactions.paymentMethodId,
        description: schema.transactions.description,
      })
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, user.id)),
    db
      .select({ id: schema.paymentMethods.id, name: schema.paymentMethods.name })
      .from(schema.paymentMethods)
      .where(eq(schema.paymentMethods.userId, user.id)),
  ]);

  const accountById = new Map(accountRows.map((a) => [a.id, a.name]));
  const cutoff = '2026-03-01';
  const recent = txRows.filter((tx) => tx.transactionDate >= cutoff);
  const older = txRows.filter((tx) => tx.transactionDate < cutoff);

  console.log(`\nTotal DB transactions: ${txRows.length}`);
  console.log(`  Before ${cutoff}: ${older.length}`);
  console.log(`  Since  ${cutoff}: ${recent.length}  <-- would be deleted`);

  console.log(`\n--- Transactions >= ${cutoff} ---`);
  for (const tx of recent.sort((a, b) => a.transactionDate.localeCompare(b.transactionDate))) {
    const acct = accountById.get(tx.paymentMethodId) ?? tx.paymentMethodId;
    const desc = (tx.description ?? '').slice(0, 60);
    console.log(
      `  ${tx.transactionDate} | ${tx.type.padEnd(8)} | ${tx.amount.padStart(10)} | ${acct.padEnd(18)} | ${desc}`,
    );
  }

  await pool.end();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
