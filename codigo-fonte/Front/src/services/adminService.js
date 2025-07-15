import api from "./api";

// Função para buscar a lista de pedidos para o painel de admin
export const getAdminPedidos = async () => {
  try {
    const response = await api.get("/admin/pedidos");
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