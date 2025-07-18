import api from "./api"; // Seu arquivo de configuração do axios

// Função para buscar os dados do dashboard
export const getDashboardData = async () => {
  try {
    const response = await api.get("/usuarios/dashboard");
    return response.data;
  } catch (error) {
    // Lança o erro para que o componente que chamou possa tratá-lo
    throw error.response?.data?.msg || "Erro ao buscar dados do dashboard";
  }
};

// Função para buscar os dados completos da conta do usuário
export const getAccountData = async () => {
  try {
    const response = await api.get("/usuarios/conta");
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || "Erro ao buscar dados da conta";
  }
};

// Função para atualizar os dados da conta do usuário
export const updateAccountData = async (userData) => {
  try {
    const response = await api.put("/usuarios/conta", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Erro ao atualizar dados da conta";
  }
};

// Função para buscar a lista de pedidos finalizados
export const getPedidos = async () => {
  try {
    const response = await api.get("/pedidos");
    return response.data;
  } catch (error) {
    throw error.response?.data?.erro || "Erro ao buscar pedidos";
  }
};

// Função para buscar os detalhes de um pedido específico
export const getDetalhePedido = async (id) => {
  try {
    const response = await api.get(`/pedidos/${id}`);
    console.log("Detalhes do pedido:", response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || "Erro ao buscar detalhes do pedido";
  }
};

export const alterarSenha = async (senhas) => {
  try {
    const response = await api.post("/usuarios/alterar-senha", senhas);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Erro ao alterar a senha";
  }
};