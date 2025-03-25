/*
  Warnings:

  - Added the required column `cor` to the `produtos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tamanho` to the `produtos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `produtos` ADD COLUMN `cor` ENUM('VERMELHO', 'AZUL', 'AMARELO', 'VERDE', 'PRETO', 'BRANCO', 'ROSA') NOT NULL,
    ADD COLUMN `tamanho` ENUM('P', 'M', 'G', 'GG') NOT NULL;
