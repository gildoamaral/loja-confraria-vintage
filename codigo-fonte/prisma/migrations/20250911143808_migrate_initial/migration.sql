-- CreateTable
CREATE TABLE `Usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `sobrenome` VARCHAR(191) NOT NULL,
    `dataNascimento` DATETIME(3) NOT NULL,
    `cpf` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `rua` VARCHAR(191) NULL,
    `numero` VARCHAR(191) NULL,
    `complemento` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `ddd` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `posicao` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `emailVerifyToken` VARCHAR(191) NULL,
    `emailTokenExpires` DATETIME(3) NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpires` DATETIME(3) NULL,

    UNIQUE INDEX `Usuarios_cpf_key`(`cpf`),
    UNIQUE INDEX `Usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `preco` DOUBLE NOT NULL,
    `peso` DOUBLE NULL,
    `altura` DOUBLE NULL,
    `largura` DOUBLE NULL,
    `comprimento` DOUBLE NULL,
    `quantidade` INTEGER NOT NULL,
    `cor` VARCHAR(191) NOT NULL,
    `tamanho` ENUM('PP', 'P', 'M', 'G', 'GG') NOT NULL,
    `categoria` ENUM('SAIA', 'SHORT', 'CALÇA', 'BLUSA', 'CAMISA', 'CONJUNTOS', 'VESTIDO', 'CALCADO', 'ACESSORIOS', 'OUTROS') NOT NULL,
    `ocasiao` ENUM('CASAMENTO', 'BATIZADO', 'MADRINHAS', 'FORMATURA', 'OCASIOES_ESPECIAIS', 'CASUAL', 'FESTAS', 'OUTROS') NULL,
    `precoPromocional` DOUBLE NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `emDestaque` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produto_imagens` (
    `id` VARCHAR(191) NOT NULL,
    `urls` JSON NOT NULL,
    `posicao` INTEGER NOT NULL DEFAULT 0,
    `produtoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pedidos` (
    `id` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('CARRINHO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO', 'EM_PREPARACAO', 'EM_TRANSPORTE', 'FINALIZADO', 'EM_DEVOLUCAO', 'DEVOLVIDO', 'REEMBOLSADO') NOT NULL DEFAULT 'CARRINHO',
    `usuarioId` INTEGER NOT NULL,
    `dataFinalizado` DATETIME(3) NULL,
    `codigoRastreio` VARCHAR(191) NULL,
    `empresaFrete` VARCHAR(191) NULL,
    `empresaFreteId` INTEGER NULL,
    `QrCode` VARCHAR(191) NULL,
    `enderecoEntrega` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `rua` VARCHAR(191) NULL,
    `numero` VARCHAR(191) NULL,
    `complemento` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `pesoFrete` DOUBLE NULL,
    `alturaFrete` DOUBLE NULL,
    `larguraFrete` DOUBLE NULL,
    `comprimentoFrete` DOUBLE NULL,
    `chaveNotaFiscal` VARCHAR(191) NULL,
    `melhorEnvioId` VARCHAR(191) NULL,
    `statusEtiqueta` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemPedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pedidoId` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `precoUnitario` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConteudoSobreNos` (
    `id` VARCHAR(191) NOT NULL,
    `secao` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `texto` TEXT NOT NULL,
    `urlsImagem` JSON NOT NULL,
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ConteudoSobreNos_secao_key`(`secao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pagamentos` (
    `id` VARCHAR(191) NOT NULL,
    `pedidoId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADO', 'FALHOU', 'ESTORNADO', 'CANCELADO', 'REEMBOLSADO') NOT NULL,
    `metodo` ENUM('CARTAO', 'BOLETO', 'PIX') NOT NULL,
    `valorProdutos` DOUBLE NOT NULL,
    `valorFrete` DOUBLE NOT NULL,
    `valorTaxaCartao` DOUBLE NULL,
    `valorTaxaParcelamento` DOUBLE NULL,
    `descontos` DOUBLE NULL,
    `valorTotal` DOUBLE NOT NULL,
    `pixQrCodeBase64` TEXT NULL,
    `pixQrCode` TEXT NULL,
    `parcelas` INTEGER NULL,
    `gatewayTransactionId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Pagamentos_pedidoId_key`(`pedidoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MelhorEnvioAuth` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `accessToken` TEXT NOT NULL,
    `refreshToken` TEXT NOT NULL,
    `expiresIn` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carrossel_imagens` (
    `id` VARCHAR(191) NOT NULL,
    `urls` JSON NOT NULL,
    `posicao` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `produto_imagens` ADD CONSTRAINT `produto_imagens_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedidos` ADD CONSTRAINT `Pedidos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPedido` ADD CONSTRAINT `ItemPedido_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedidos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPedido` ADD CONSTRAINT `ItemPedido_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagamentos` ADD CONSTRAINT `Pagamentos_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedidos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
