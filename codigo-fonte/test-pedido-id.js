// Teste do sistema de ID de pedidos personalizado

const gerarIdPedido = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

console.log('🧪 Testando o novo sistema de IDs de pedidos:');
console.log('==========================================');

for (let i = 1; i <= 10; i++) {
  const id = gerarIdPedido();
  console.log(`Pedido ${i.toString().padStart(2, '0')}: ${id}`);
}

console.log('==========================================');
console.log('✅ IDs gerados com 8 caracteres alfanuméricos');
console.log('📝 Formato: Letras maiúsculas + números (A-Z, 0-9)');
console.log('🎯 Exemplo de uso: Pedido #A4B7X9M2');
