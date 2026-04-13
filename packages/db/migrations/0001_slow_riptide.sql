ALTER TABLE "transactions" DROP CONSTRAINT "transactions_amount_check";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "check_category_for_non_transfer";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "check_transfer_to_payment";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "check_transfer_different_accounts";--> statement-breakpoint
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_period_type_check";--> statement-breakpoint
ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_user_id_fkey";
--> statement-breakpoint
DROP INDEX "idx_users_email";--> statement-breakpoint
DROP INDEX "idx_payment_methods_active";--> statement-breakpoint
DROP INDEX "idx_payment_methods_user_id";--> statement-breakpoint
DROP INDEX "idx_categories_parent_id";--> statement-breakpoint
DROP INDEX "idx_categories_type";--> statement-breakpoint
DROP INDEX "idx_categories_user_id";--> statement-breakpoint
DROP INDEX "idx_labels_name";--> statement-breakpoint
DROP INDEX "idx_labels_user";--> statement-breakpoint
DROP INDEX "idx_transactions_category";--> statement-breakpoint
DROP INDEX "idx_transactions_date";--> statement-breakpoint
DROP INDEX "idx_transactions_label";--> statement-breakpoint
DROP INDEX "idx_transactions_not_deleted";--> statement-breakpoint
DROP INDEX "idx_transactions_payment_method";--> statement-breakpoint
DROP INDEX "idx_transactions_type";--> statement-breakpoint
DROP INDEX "idx_transactions_user_id";--> statement-breakpoint
DROP INDEX "idx_budgets_category";--> statement-breakpoint
DROP INDEX "idx_budgets_dates";--> statement-breakpoint
DROP INDEX "idx_budgets_user";--> statement-breakpoint
DROP INDEX "idx_user_settings_user_id";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "is_default" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "transaction_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "is_deleted" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "category_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "label_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_active" ON "payment_methods" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_user_id" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_categories_parent_id" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_categories_type" ON "categories" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_categories_user_id" ON "categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_labels_name" ON "labels" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "idx_labels_user" ON "labels" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_category" ON "transactions" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_date" ON "transactions" USING btree ("user_id","transaction_date" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "idx_transactions_label" ON "transactions" USING btree ("label_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_not_deleted" ON "transactions" USING btree ("user_id","is_deleted");--> statement-breakpoint
CREATE INDEX "idx_transactions_payment_method" ON "transactions" USING btree ("payment_method_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_type" ON "transactions" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_id" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_budgets_category" ON "budgets" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_budgets_dates" ON "budgets" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_budgets_user" ON "budgets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_settings_user_id" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN "period_type";--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_amount_check" CHECK (amount > 0);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "check_category_for_non_transfer" CHECK (type = 'transfer' OR category_id IS NOT NULL);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "check_transfer_to_payment" CHECK (type <> 'transfer' OR to_payment_method_id IS NOT NULL);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "check_transfer_different_accounts" CHECK (type <> 'transfer' OR payment_method_id <> to_payment_method_id);