// src/config/embalagens.js

// Lista de embalagens disponíveis, ordenadas da MENOR para a MAIOR.
// É crucial que elas estejam ordenadas por volume para a nossa lógica funcionar.

export const embalagens = [
  {
    id: 'envelope_seguranca',
    nome: 'Envelope de Segurança',
    comprimento: 20, // cm 
    largura: 15,     // cm 
    altura: 5,       // cm 
    peso: 0.05,      // 50g em kg 
    volumeMax: (20 * 15 * 5) / 1000, // Volume em litros
  },
  {
    id: 'caixa_p',
    nome: 'Caixa Pequena',
    comprimento: 30, // cm 
    largura: 25,     // cm 
    altura: 10,      // cm 
    peso: 0.15,      // 150g em kg 
    volumeMax: (30 * 25 * 10) / 1000,
  },
  {
    id: 'caixa_m',
    nome: 'Caixa Média',
    comprimento: 40, // cm 
    largura: 30,     // cm 
    altura: 15,      // cm 
    peso: 0.25,      // 250g em kg 
    volumeMax: (40 * 30 * 15) / 1000,
  },
  // Adicione mais caixas conforme necessário, sempre da menor para a maior
];