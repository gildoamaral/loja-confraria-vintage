/*
  Warnings:

  - You are about to alter the column `imagem` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.

*/
-- AlterTable
ALTER TABLE `produtos` MODIFY `imagem` JSON NOT NULL;
