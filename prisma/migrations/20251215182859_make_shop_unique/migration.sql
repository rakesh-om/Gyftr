/*
  Warnings:

  - A unique constraint covering the columns `[shop]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Setting_accessToken_key` ON `Setting`;

-- CreateIndex
CREATE UNIQUE INDEX `Setting_shop_key` ON `Setting`(`shop`);
