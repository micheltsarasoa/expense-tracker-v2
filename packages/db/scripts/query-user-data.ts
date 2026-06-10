import { config } from 'dotenv';
config({ path: '../../.env.local' });
config({ path: '../../.env' });

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../src/schema';
import { eq, isNull, or } from 'drizzle-orm';

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

  console.log(`\nUSER: ${user.name} (${user.email}) -- id: ${user.id}`);

  const accounts = await db
    .select()
    .from(schema.paymentMethods)
    .where(eq(schema.paymentMethods.userId, user.id));
  console.log('\n=== PAYMENT METHODS / ACCOUNTS ===');
  for (const a of accounts) console.log(`  ${a.name} [type:${a.type}] active:${a.isActive}`);

  const cats = await db
    .select()
    .from(schema.categories)
    .where(or(eq(schema.categories.userId, user.id), isNull(schema.categories.userId)));
  console.log('\n=== CATEGORIES ===');
  for (const c of cats.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)))
    console.log(`  [${c.type}] ${c.name} ${c.isDefault ? '(default)' : '(user)'}`);

  const labels = await db.select().from(schema.labels).where(eq(schema.labels.userId, user.id));
  console.log('\n=== LABELS ===');
  for (const l of labels) console.log(`  ${l.name}`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
