import api from "./api";

// Função para buscar a lista de pedidos para o painel de admin
export const getAdminPedidos = async (page = 1) => {
  try {
    // Agora enviamos o parâmetro 'page' na URL
    const response = await api.get(`/admin/pedidos?page=${page}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || "Erro ao buscar pedidos";
  }
};

export const updatePedidoStatus = async (id, dados) => {
  try {
    const response = await api.patch(`/admin/pedidos/${id}/status`, dados);
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || "Erro ao atualizar status do pedido";
  }
};

// Função para buscar os detalhes de um pedido específico para o admin
export const getAdminPedidoDetalhes = async (id) => {
  try {
    const response = await api.get(`/admin/pedidos/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || "Erro ao buscar detalhes do pedido";
  }
};