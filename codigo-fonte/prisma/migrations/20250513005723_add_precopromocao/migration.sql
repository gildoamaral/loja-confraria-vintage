-- AlterTable
ALTER TABLE `produtos` ADD COLUMN `precoPromocional` DOUBLE NULL,
    MODIFY `ocasiao` ENUM('CASAMENTO', 'BATIZADO', 'MADRINHAS', 'FORMATURA') NULL;
