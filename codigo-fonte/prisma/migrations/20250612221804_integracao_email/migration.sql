-- AlterTable
ALTER TABLE `Usuarios` ADD COLUMN `emailTokenExpires` DATETIME(3) NULL,
    ADD COLUMN `emailVerifyToken` VARCHAR(191) NULL,
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpires` DATETIME(3) NULL;
