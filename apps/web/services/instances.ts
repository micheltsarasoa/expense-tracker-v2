import { db } from '@expense-tracker/db';
import { SettingsService } from './settings.service';
import { CategoryService } from './category.service';
import { LabelService } from './label.service';
import { PaymentMethodService } from './payment-method.service';
import { TransactionService } from './transaction.service';
import { BudgetService } from './budget.service';
import { ReportService } from './report.service';
import { ImportService } from './import.service';

export const settingsService = new SettingsService(db);
export const categoryService = new CategoryService(db);
export const labelService = new LabelService(db);
export const paymentMethodService = new PaymentMethodService(db);
export const transactionService = new TransactionService(db);
export const budgetService = new BudgetService(db);
export const reportService = new ReportService(db);
export const importService = new ImportService(db, transactionService);
