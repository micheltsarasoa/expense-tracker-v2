CREATE TYPE "public"."transfer_leg" AS ENUM('out', 'in');--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "transfer_group_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "transfer_leg" "transfer_leg";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transactions_transfer_leg" ON "transactions" USING btree ("transfer_group_id","transfer_leg") WHERE transfer_group_id IS NOT NULL;