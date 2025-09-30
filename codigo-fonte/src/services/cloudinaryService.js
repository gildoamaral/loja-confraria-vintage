const cloudinary = require('../config/cloudinary.js');

/**
 * Deleta múltiplas versões de uma imagem do Cloudinary.
 * @param {object} urls - O objeto JSON contendo as URLs. Ex: { large: "...", medium: "...", thumbnail: "..." }
 */
const deleteImageVersionsFromCloudinary = async (urls) => {
  if (!urls || typeof urls !== 'object' || Object.keys(urls).length === 0) {
    console.log('Nenhuma URL fornecida para deletar.');
    return;
  }

  try {
    // Extrai os public_ids das URLs do Cloudinary
    const publicIdsToDelete = Object.values(urls).map(url => {
      // URL do Cloudinary: https://res.cloudinary.com/cloud/image/upload/v123/folder/public_id.webp
      const urlParts = url.split('/');
      const fileWithExtension = urlParts[urlParts.length - 1];
      const publicId = fileWithExtension.split('.')[0]; // Remove a extensão
      
      // Se estiver em uma pasta, inclui o caminho da pasta
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        // Pula a versão (v123) e pega o caminho da pasta + arquivo
        const pathParts = urlParts.slice(uploadIndex + 2, -1);
        return pathParts.length > 0 ? `${pathParts.join('/')}/${publicId}` : publicId;
      }
      
      return publicId;
    });

    // Remove duplicatas
    const uniquePublicIds = [...new Set(publicIdsToDelete)];

    // Deleta múltiplas imagens de uma vez
    if (uniquePublicIds.length > 0) {
      const result = await cloudinary.api.delete_resources(uniquePublicIds);
      console.log(`Arquivos deletados com sucesso do Cloudinary:`, uniquePublicIds.join(', '));
      return result;
    }

  } catch (error) {
    console.error("Erro ao deletar objetos do Cloudinary:", error);
  }
};

module.exports = { deleteImageVersionsFromCloudinary };