// Arquivo: src/services/s3Service.js
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName } = require('../config/aws.js');

/**
 * Deleta múltiplas versões de uma imagem do S3.
 * @param {object} urls - O objeto JSON contendo as URLs. Ex: { large: "...", medium: "...", thumbnail: "..." }
 */
const deleteImageVersionsFromS3 = async (urls) => {
  // Verifica se o objeto de URLs é válido
  if (!urls || typeof urls !== 'object' || Object.keys(urls).length === 0) {
    console.log('Nenhuma URL fornecida para deletar.');
    return;
  }

  try {
    // 1. Extrai os nomes dos arquivos (Keys) a partir das URLs completas
    const objectsToDelete = Object.values(urls).map(url => {
      // Pega a última parte da URL, que é o nome do arquivo (a Key no S3)
      const key = url.split('/').pop();
      return { Key: key };
    });

    // Se não houver objetos a deletar, retorna
    if(objectsToDelete.length === 0) {
      return;
    }

    // 2. Prepara os parâmetros para o comando de deleção em massa
    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: objectsToDelete,
        Quiet: true, // Não retorna informações sobre cada arquivo deletado com sucesso
      },
    };

    // 3. Envia o comando para o S3
    const command = new DeleteObjectsCommand(deleteParams);
    await s3Client.send(command);

    console.log(`Arquivos deletados com sucesso do S3:`, objectsToDelete.map(o => o.Key).join(', '));

  } catch (error) {
    console.error("Erro ao deletar objetos do S3:", error);
    // Em um app de produção, você poderia logar este erro mas não parar a execução
  }
};

module.exports = { deleteImageVersionsFromS3 };