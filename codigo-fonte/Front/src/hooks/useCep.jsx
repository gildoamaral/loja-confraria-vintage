import { useState, useCallback } from 'react';

const VIA_CEP_URL = 'https://viacep.com.br/ws/';

/**
 * Hook customizado para buscar informações de endereço a partir de um CEP.
 * @returns {object} Contendo os dados do endereço, estado de loading, erro e a função de busca.
 */
export const useCep = () => {
  const [addressData, setAddressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAddress = useCallback(async (cep) => {
    const cleanedCep = cep.replace(/\D/g, '');

    if (cleanedCep.length !== 8) {
      setError('CEP deve conter exatamente 8 dígitos');
      return;
    }

    setLoading(true);
    setError(null);
    setAddressData(null);

    try {
      const response = await fetch(`${VIA_CEP_URL}${cleanedCep}/json/`);
      
      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.erro) {
        throw new Error('CEP não encontrado. Verifique o número digitado.');
      }

      // Validação adicional para campos obrigatórios
      if (!result.logradouro && !result.bairro && !result.localidade) {
        throw new Error('CEP válido, mas sem informações de endereço disponíveis.');
      }

      // Mapeia os campos da API para os nomes que usamos no nosso formulário
      const mappedData = {
        rua: result.logradouro || '',
        bairro: result.bairro || '',
        cidade: result.localidade || '',
        estado: result.uf || '',
      };

      setAddressData(mappedData);

    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(err.message || 'Não foi possível buscar o CEP.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setAddressData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { addressData, loading, error, fetchAddress, clearData };
};