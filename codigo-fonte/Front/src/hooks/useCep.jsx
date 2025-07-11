import { useState, useCallback } from 'react';

// API base para a consulta
const VIA_CEP_URL = 'https://viacep.com.br/ws/';

/**
 * Hook customizado para buscar informações de endereço a partir de um CEP.
 * @returns {object} Contendo os dados do endereço, estado de loading, erro e a função de busca.
 */
export const useCep = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAddress = useCallback(async (cep) => {
    // Limpa apenas os caracteres não numéricos do CEP
    const cleanedCep = cep.replace(/\D/g, '');

    // Verifica se o CEP tem o tamanho correto (8 dígitos)
    if (cleanedCep.length !== 8) {
      setError('CEP inválido. Por favor, digite 8 números.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`${VIA_CEP_URL}${cleanedCep}/json/`);
      const result = await response.json();

      if (result.erro) {
        throw new Error('CEP não encontrado.');
      }
      
      // Mapeia os campos da API para os nomes que usamos no nosso formulário
      const addressData = {
        rua: result.logradouro,
        bairro: result.bairro,
        cidade: result.localidade,
        estado: result.uf,
      };

      setData(addressData);

    } catch (err) {
      setError(err.message || 'Não foi possível buscar o CEP.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchAddress };
};