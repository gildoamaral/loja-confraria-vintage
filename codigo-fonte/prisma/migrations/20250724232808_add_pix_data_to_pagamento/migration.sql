-- AlterTable
ALTER TABLE `pagamentos` ADD COLUMN `pixQrCode` TEXT NULL,
    ADD COLUMN `pixQrCodeBase64` TEXT NULL;

-- AlterTable
ALTER TABLE `pedidos` ADD COLUMN `QrCode` VARCHAR(191) NULL;
