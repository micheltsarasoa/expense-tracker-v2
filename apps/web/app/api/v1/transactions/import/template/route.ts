const CSV_TEMPLATE = 'date;type;amount;account;category;toAccount;label;description\n';

export function GET() {
  return new Response(CSV_TEMPLATE, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="import-template.csv"',
    },
  });
}
