-- DropForeignKey
ALTER TABLE `itempedido` DROP FOREIGN KEY `ItemPedido_produtoId_fkey`;

-- DropIndex
DROP INDEX `ItemPedido_produtoId_fkey` ON `itempedido`;

-- AlterTable
ALTER TABLE `pedidos` ADD COLUMN `bairro` VARCHAR(191) NULL,
    ADD COLUMN `cep` VARCHAR(191) NULL,
    ADD COLUMN `cidade` VARCHAR(191) NULL,
    ADD COLUMN `complemento` VARCHAR(191) NULL,
    ADD COLUMN `estado` VARCHAR(191) NULL,
    ADD COLUMN `numero` VARCHAR(191) NULL,
    ADD COLUMN `rua` VARCHAR(191) NULL,
    MODIFY `enderecoEntrega` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `produtos` ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `descricao` VARCHAR(500) NOT NULL;

-- AddForeignKey
ALTER TABLE `ItemPedido` ADD CONSTRAINT `ItemPedido_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
