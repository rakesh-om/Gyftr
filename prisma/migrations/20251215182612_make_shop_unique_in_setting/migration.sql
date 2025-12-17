/*
  Warnings:

  - A unique constraint covering the columns `[accessToken]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Setting_accessToken_key` ON `Setting`(`accessToken`);
