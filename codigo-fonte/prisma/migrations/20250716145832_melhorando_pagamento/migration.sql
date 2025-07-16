/*
  Warnings:

  - You are about to drop the column `valor` on the `pagamentos` table. All the data in the column will be lost.
  - Added the required column `precoUnitario` to the `ItemPedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorFrete` to the `Pagamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorProdutos` to the `Pagamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorTotal` to the `Pagamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `itempedido` ADD COLUMN `precoUnitario` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `pagamentos` DROP COLUMN `valor`,
    ADD COLUMN `descontos` DOUBLE NULL,
    ADD COLUMN `gatewayTransactionId` VARCHAR(191) NULL,
    ADD COLUMN `valorFrete` DOUBLE NOT NULL,
    ADD COLUMN `valorProdutos` DOUBLE NOT NULL,
    ADD COLUMN `valorTaxaCartao` DOUBLE NULL,
    ADD COLUMN `valorTaxaParcelamento` DOUBLE NULL,
    ADD COLUMN `valorTotal` DOUBLE NOT NULL;
