/*
  Warnings:

  - Added the required column `categoria` to the `produtos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ocasiao` to the `produtos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `produtos` ADD COLUMN `categoria` ENUM('SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 'VESTIDO') NOT NULL,
    ADD COLUMN `ocasiao` ENUM('CASAMENTO', 'BATIZADO', 'MADRINHAS', 'FORMATURA') NOT NULL;
