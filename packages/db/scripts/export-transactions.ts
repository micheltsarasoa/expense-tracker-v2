import { config } from 'dotenv';
config({ path: '../../.env.local' });
config({ path: '../../.env' });

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../src/schema';
import { eq, isNull, or } from 'drizzle-orm';
import { writeFileSync } from 'fs';

async function main() {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env['DATABASE_URL']! });
  const db = drizzle({ client: pool, schema });

  const EMAIL = 'micheltsarasoa@gmail.com';
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, EMAIL) });
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

  const output = txRows.map((tx) => ({
    date: tx.transactionDate,
    amount: tx.amount,
    account: accountById.get(tx.paymentMethodId) ?? tx.paymentMethodId,
    type: tx.type,
    description: tx.description ?? '',
  }));

  writeFileSync('scripts/existing-transactions.json', JSON.stringify(output, null, 2));
  console.log(`Exported ${output.length} existing transactions.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
