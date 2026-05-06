import { controller } from '@/lib/controller';

const CSV_TEMPLATE = 'date,type,amount,account,category,toAccount,label,description\n';

export const GET = controller(() => {
  return Promise.resolve(
    new Response(CSV_TEMPLATE, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="import-template.csv"',
      },
    }),
  );
});
