'use client';

import { useState } from 'react';
import { Upload, FileDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ImportResponse } from '@expense-tracker/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { validateImport, commitImport } from '@/app/(dahsboard)/transactions/actions';

interface ImportTransactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful commit so the parent can refresh the list. */
  onImported: () => void;
}

const MAX_ERROR_ROWS = 20;

export function ImportTransactionsModal({
  open,
  onOpenChange,
  onImported,
}: ImportTransactionsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportResponse | null>(null);
  const [busy, setBusy] = useState<'validate' | 'commit' | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setReport(null);
    setBusy(null);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setReport(null);
    setError(null);
  }

  async function handleValidate() {
    if (!file) return;
    setBusy('validate');
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    const res = await validateImport(fd);
    setBusy(null);
    if (res.ok) setReport(res.data);
    else setError(res.error ?? 'Could not read the file. Please check the format.');
  }

  async function handleCommit() {
    if (!file || !report || report.valid === 0) return;
    setBusy('commit');
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    const res = await commitImport(fd);
    setBusy(null);
    if (res.ok) {
      toast.success(`Imported ${res.data.valid} transaction${res.data.valid === 1 ? '' : 's'}`);
      onImported();
      handleOpenChange(false);
    } else {
      setError(res.error ?? 'Import failed. Please try again.');
    }
  }

  const invalidRows = report?.results.filter((r) => r.status === 'invalid') ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV to add many transactions at once. We&apos;ll preview it before anything is
            saved.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Format hint + template */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              Expected columns (semicolon <code>;</code> separated)
            </p>
            <p className="mt-1">
              <code>date;type;amount;account;category;toAccount;label;description</code>
            </p>
            <ul className="mt-2 list-disc pl-4 space-y-0.5">
              <li>
                <strong>date</strong> in <code>YYYY-MM-DD</code> format
              </li>
              <li>
                <strong>amount</strong> with <code>.</code> or <code>,</code> decimals (
                <code>12.50</code> or <code>12,50</code>)
              </li>
              <li>
                <strong>type</strong> is income, expense, or transfer
              </li>
              <li>
                <strong>account</strong>, <strong>category</strong>, and <strong>label</strong> are
                matched by name
              </li>
            </ul>
            <a
              href="/api/v1/transactions/import/template"
              download
              className="mt-2 inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <FileDown className="size-3.5" />
              Download template
            </a>
          </div>

          {/* File picker */}
          <div className="flex flex-col gap-1.5">
            <Input type="file" accept=".csv,text/csv" onChange={onFileChange} className="text-sm" />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview report */}
          {report && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground">{report.total} rows</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  {report.valid} valid
                </span>
                {report.invalid > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <AlertCircle className="size-4" />
                    {report.invalid} invalid
                  </span>
                )}
              </div>

              {invalidRows.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border text-xs">
                  {invalidRows.slice(0, MAX_ERROR_ROWS).map((r) => (
                    <div key={r.row} className="flex gap-2 p-2">
                      <span className="shrink-0 font-medium text-muted-foreground">
                        Row {r.row}
                      </span>
                      <span className="text-rose-600 dark:text-rose-400">
                        {r.errors?.join('; ')}
                      </span>
                    </div>
                  ))}
                  {invalidRows.length > MAX_ERROR_ROWS && (
                    <div className="p-2 text-muted-foreground">
                      …and {invalidRows.length - MAX_ERROR_ROWS} more
                    </div>
                  )}
                </div>
              )}

              {report.valid === 0 && (
                <p className="text-sm text-muted-foreground">
                  No valid rows to import. Fix the errors above and re-upload.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={busy !== null}
          >
            Cancel
          </Button>
          {report && report.valid > 0 ? (
            <Button onClick={handleCommit} disabled={busy !== null}>
              {busy === 'commit' ? <Spinner className="mr-2 size-4" /> : null}
              {busy === 'commit'
                ? 'Importing…'
                : `Import ${report.valid} row${report.valid === 1 ? '' : 's'}`}
            </Button>
          ) : (
            <Button onClick={handleValidate} disabled={!file || busy !== null}>
              {busy === 'validate' ? (
                <Spinner className="mr-2 size-4" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              {busy === 'validate' ? 'Checking…' : 'Preview'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
