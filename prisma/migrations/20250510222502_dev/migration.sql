/*
  Warnings:

  - You are about to drop the column `icon` on the `amenities` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `workspaces` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `workspaces` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `amenities` DROP COLUMN `icon`;

-- AlterTable
ALTER TABLE `bookings` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `workspaces` DROP COLUMN `latitude`,
    DROP COLUMN `longitude`;
