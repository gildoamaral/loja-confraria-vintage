/*
  Warnings:

  - You are about to drop the column `imagem` on the `produtos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `produtos` DROP COLUMN `imagem`;

-- CreateTable
CREATE TABLE `produto_imagens` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `posicao` INTEGER NOT NULL DEFAULT 0,
    `produtoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `produto_imagens` ADD CONSTRAINT `produto_imagens_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
