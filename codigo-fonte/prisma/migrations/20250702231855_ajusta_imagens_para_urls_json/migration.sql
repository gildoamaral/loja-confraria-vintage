/*
  Warnings:

  - You are about to drop the column `url` on the `produto_imagens` table. All the data in the column will be lost.
  - Added the required column `urls` to the `produto_imagens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `produto_imagens` DROP COLUMN `url`,
    ADD COLUMN `urls` JSON NOT NULL;
