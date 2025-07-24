import api from "./api";

// Função para buscar os produtos em destaque
export const getProdutosDestaque = async () => {
  try {
    const response = await api.get("/produtos/destaques");
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Erro ao buscar produtos em destaque";
  }
};