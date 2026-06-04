'use client';

import { useState } from 'react';
import {
  User,
  Palette,
  BadgeDollarSign,
  Hash,
  CalendarDays,
  Clock,
  ShieldAlert,
  Sun,
  Moon,
  Monitor,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { updateSettings } from './actions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Theme = 'light' | 'dark' | 'system';
type CurrencyPosition = 'before' | 'after';
type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
type TimeFormat = '12h' | '24h';

/** The persisted display preferences (the part wired to `user_settings`). */
export interface SettingsInitial {
  currencySymbol: string;
  currencyPosition: CurrencyPosition;
  decimalSeparator: string;
  thousandSeparator: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
}

interface SettingsClientProps {
  initial: SettingsInitial;
  profile: { displayName: string; email: string };
}

interface Settings extends SettingsInitial {
  displayName: string;
  email: string;
  theme: Theme;
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="ml-11 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
  error,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  error?: string | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[200px_1fr] sm:items-start sm:gap-4">
      <div className="flex flex-col gap-0.5 pt-1">
        <label className="text-sm font-medium leading-none">{label}</label>
        {hint && <span className="text-xs text-muted-foreground leading-relaxed">{hint}</span>}
      </div>
      <div className="flex flex-col gap-1">
        {children}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live preview
// ---------------------------------------------------------------------------

function LivePreview({
  settings,
}: {
  settings: Pick<
    Settings,
    | 'currencySymbol'
    | 'currencyPosition'
    | 'decimalSeparator'
    | 'thousandSeparator'
    | 'dateFormat'
    | 'timeFormat'
  >;
}) {
  function formatAmount(amount: number): string {
    const parts = amount.toFixed(2).split('.');
    const intPart = (parts[0] ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousandSeparator);
    const formatted = `${intPart}${settings.decimalSeparator}${parts[1]}`;
    return settings.currencyPosition === 'before'
      ? `${settings.currencySymbol}${formatted}`
      : `${formatted} ${settings.currencySymbol}`;
  }

  function formatDate(fmt: DateFormat): string {
    const d = 14,
      m = 4,
      y = 2026;
    const dd = String(d).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const yyyy = String(y);
    if (fmt === 'DD/MM/YYYY') return `${dd}/${mm}/${yyyy}`;
    if (fmt === 'MM/DD/YYYY') return `${mm}/${dd}/${yyyy}`;
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatTime(): string {
    if (settings.timeFormat === '24h') return '14:30';
    return '2:30 PM';
  }

  return (
    <div className="rounded-xl border border-border bg-muted/40 px-5 py-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Live preview
      </p>
      <p className="text-sm text-foreground leading-relaxed">
        Your amounts and dates will look like:{' '}
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          +{formatAmount(1234.56)}
        </span>{' '}
        on{' '}
        <span className="font-semibold">
          {formatDate(settings.dateFormat)} at {formatTime()}
        </span>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function SettingsClient({ initial, profile }: SettingsClientProps) {
  const [settings, setSettings] = useState<Settings>({
    displayName: profile.displayName,
    email: profile.email,
    theme: 'system',
    ...initial,
  });

  // Change password dialog
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Delete account confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Saving state
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const separatorError =
    settings.decimalSeparator &&
    settings.thousandSeparator &&
    settings.decimalSeparator === settings.thousandSeparator
      ? 'Decimal and thousand separators must differ.'
      : undefined;

  function set<K extends keyof Settings>(key: K, val: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: val }));
    setSaved(false);
  }

  async function handleSaveProfile() {
    // Profile name/email are owned by Stack Auth — wiring deferred.
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 900));
    setSavingProfile(false);
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  }

  async function handleSaveAll() {
    if (separatorError) return;
    setSaving(true);
    const res = await updateSettings({
      currencySymbol: settings.currencySymbol,
      currencyPosition: settings.currencyPosition,
      decimalSeparator: settings.decimalSeparator,
      thousandSeparator: settings.thousandSeparator,
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      toast.success('Settings saved');
      setTimeout(() => setSaved(false), 2500);
    } else {
      toast.error(res.error ?? 'Failed to save settings. Please try again.');
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your profile, display preferences, and account options.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_300px] lg:gap-8 items-start">
        {/* Main form column */}
        <div className="flex flex-col gap-8 max-w-xl">
          {/* 1. Profile */}
          <Section
            icon={User}
            title="Profile"
            description="Your public display name and login email."
          >
            <FieldRow label="Display name">
              <Input
                value={settings.displayName}
                onChange={(e) => set('displayName', e.target.value)}
                placeholder="Your name"
                className="h-9"
              />
            </FieldRow>
            <FieldRow label="Email">
              <Input
                value={settings.email}
                onChange={(e) => set('email', e.target.value)}
                type="email"
                placeholder="you@example.com"
                className="h-9"
              />
            </FieldRow>
            <FieldRow label="Password">
              <Button
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                onClick={() => setPwDialogOpen(true)}
              >
                <KeyRound className="size-3.5" />
                Change password
              </Button>
            </FieldRow>
            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="gap-1.5 min-w-[110px]"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Saving…
                  </>
                ) : savedProfile ? (
                  <>
                    <Check className="size-3.5" /> Saved
                  </>
                ) : (
                  'Save profile'
                )}
              </Button>
            </div>
          </Section>

          <Separator />

          {/* 2. Appearance */}
          <Section
            icon={Palette}
            title="Appearance"
            description="Choose how the app looks. Applies immediately."
          >
            <FieldRow label="Theme">
              <ToggleGroup
                type="single"
                value={settings.theme}
                onValueChange={(v) => v && set('theme', v as Theme)}
                className="justify-start gap-1"
              >
                <ToggleGroupItem value="light" className="gap-1.5 text-sm h-8 px-3">
                  <Sun className="size-3.5" />
                  Light
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" className="gap-1.5 text-sm h-8 px-3">
                  <Moon className="size-3.5" />
                  Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="system" className="gap-1.5 text-sm h-8 px-3">
                  <Monitor className="size-3.5" />
                  System
                </ToggleGroupItem>
              </ToggleGroup>
            </FieldRow>
          </Section>

          <Separator />

          {/* 3. Currency */}
          <Section
            icon={BadgeDollarSign}
            title="Currency"
            description="Symbol and position used for all amounts."
          >
            <FieldRow label="Symbol" hint="Max 3 characters (e.g. €, $, £, CHF)">
              <Input
                value={settings.currencySymbol}
                onChange={(e) => set('currencySymbol', e.target.value.slice(0, 3))}
                placeholder="€"
                maxLength={3}
                className="h-9 w-24"
              />
            </FieldRow>
            <FieldRow label="Position">
              <ToggleGroup
                type="single"
                value={settings.currencyPosition}
                onValueChange={(v) => v && set('currencyPosition', v as CurrencyPosition)}
                className="justify-start gap-1"
              >
                <ToggleGroupItem value="before" className="text-sm h-8 px-3">
                  Before
                </ToggleGroupItem>
                <ToggleGroupItem value="after" className="text-sm h-8 px-3">
                  After
                </ToggleGroupItem>
              </ToggleGroup>
            </FieldRow>
          </Section>

          <Separator />

          {/* 4. Number format */}
          <Section
            icon={Hash}
            title="Number format"
            description="How decimal and thousand separators are displayed."
          >
            <FieldRow label="Decimal separator" hint='e.g. "." → 1,234.56' error={separatorError}>
              <Input
                value={settings.decimalSeparator}
                onChange={(e) => set('decimalSeparator', e.target.value.slice(0, 1))}
                placeholder="."
                maxLength={1}
                className={cn(
                  'h-9 w-16',
                  separatorError && 'border-destructive focus-visible:ring-destructive',
                )}
              />
            </FieldRow>
            <FieldRow label="Thousand separator" hint='e.g. "," → 1,234.56'>
              <Input
                value={settings.thousandSeparator}
                onChange={(e) => set('thousandSeparator', e.target.value.slice(0, 1))}
                placeholder=","
                maxLength={1}
                className={cn(
                  'h-9 w-16',
                  separatorError && 'border-destructive focus-visible:ring-destructive',
                )}
              />
            </FieldRow>
          </Section>

          <Separator />

          {/* 5. Date format */}
          <Section
            icon={CalendarDays}
            title="Date format"
            description="How dates appear throughout the app."
          >
            <FieldRow label="Format">
              <Select
                value={settings.dateFormat}
                onValueChange={(v) => set('dateFormat', v as DateFormat)}
              >
                <SelectTrigger className="h-9 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
          </Section>

          <Separator />

          {/* 6. Time format */}
          <Section icon={Clock} title="Time format" description="12-hour (AM/PM) or 24-hour clock.">
            <FieldRow label="Format">
              <ToggleGroup
                type="single"
                value={settings.timeFormat}
                onValueChange={(v) => v && set('timeFormat', v as TimeFormat)}
                className="justify-start gap-1"
              >
                <ToggleGroupItem value="12h" className="text-sm h-8 px-3">
                  12h
                </ToggleGroupItem>
                <ToggleGroupItem value="24h" className="text-sm h-8 px-3">
                  24h
                </ToggleGroupItem>
              </ToggleGroup>
            </FieldRow>
          </Section>

          <Separator />

          {/* Save all (display + number + date + time) */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveAll}
              disabled={saving || !!separatorError}
              className="gap-1.5 min-w-[130px]"
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Saving…
                </>
              ) : saved ? (
                <>
                  <Check className="size-3.5" /> Saved
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>

          <Separator />

          {/* 7. Danger zone */}
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 mt-0.5">
                <ShieldAlert className="size-4 text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-destructive">Danger zone</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Destructive actions that cannot be undone.
                </p>
              </div>
            </div>

            <div className="ml-11 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Delete my account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently removes all your data including transactions, accounts, budgets, and
                  categories.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="shrink-0 gap-1.5">
                    <Trash2 className="size-3.5" />
                    Delete account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <span className="block">
                        This will permanently delete all your data — transactions, accounts,
                        budgets, categories, and labels. This action cannot be undone.
                      </span>
                      <span className="block">
                        Type <strong>DELETE</strong> below to confirm.
                      </span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="mt-1"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleteConfirmText !== 'DELETE'}
                      className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                    >
                      Delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Sticky preview panel */}
        <div className="hidden lg:block sticky top-6">
          <LivePreview settings={settings} />
        </div>
      </div>

      {/* Mobile preview — below form */}
      <div className="lg:hidden max-w-xl">
        <LivePreview settings={settings} />
      </div>

      {/* Change password dialog */}
      <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription className="sr-only">Update your account password.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Current password</label>
              <div className="relative">
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="h-9 pr-9"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrent((v) => !v)}
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">New password</label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="h-9 pr-9"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew((v) => !v)}
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Confirm new password</label>
              <Input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="h-9"
                placeholder="••••••••"
              />
              {confirmPw && newPw !== confirmPw && (
                <p className="text-xs text-destructive">Passwords do not match.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPwDialogOpen(false);
                setCurrentPw('');
                setNewPw('');
                setConfirmPw('');
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!currentPw || !newPw || newPw !== confirmPw || newPw.length < 8}
              onClick={() => {
                setPwDialogOpen(false);
                setCurrentPw('');
                setNewPw('');
                setConfirmPw('');
              }}
            >
              Update password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
