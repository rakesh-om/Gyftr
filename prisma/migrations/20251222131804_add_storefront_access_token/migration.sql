/*
  Warnings:

  - You are about to drop the `Balance` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `shopify_sessions` ADD COLUMN `storefront_access_token` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `Balance`;
