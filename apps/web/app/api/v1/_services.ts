import { db } from '@expense-tracker/db';
import { SettingsService } from '@/services/settings.service';
import { CategoryService } from '@/services/category.service';
import { LabelService } from '@/services/label.service';
import { PaymentMethodService } from '@/services/payment-method.service';
import { TransactionService } from '@/services/transaction.service';
import { BudgetService } from '@/services/budget.service';
import { ReportService } from '@/services/report.service';
import { ImportService } from '@/services/import.service';

export const settingsService = new SettingsService(db);
export const categoryService = new CategoryService(db);
export const labelService = new LabelService(db);
export const paymentMethodService = new PaymentMethodService(db);
export const transactionService = new TransactionService(db);
export const budgetService = new BudgetService(db);
export const reportService = new ReportService(db);
export const importService = new ImportService(db, transactionService);
