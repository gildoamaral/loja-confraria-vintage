// src/config/embalagens.js

// Lista de embalagens disponíveis, ordenadas da MENOR para a MAIOR.
// É crucial que elas estejam ordenadas por volume para a nossa lógica funcionar.

const embalagens = [
  {
    id: 'envelope_seguranca',
    nome: 'Envelope de Segurança',
    comprimento: 20, // cm 
    largura: 15,     // cm 
    altura: 5,       // cm 
    peso: 0.05,       
    volumeMax: (20 * 15 * 5) / 1000, // Volume em litros
  },
  {
    id: 'caixa_p',
    nome: 'Caixa Pequena',
    comprimento: 25, // cm 
    largura: 20,     // cm 
    altura: 5,      // cm 
    peso: 0.1,      
    volumeMax: (20 * 25 * 5) / 1000,
  },
  {
    id: 'caixa_m',
    nome: 'Caixa Média',
    comprimento: 30, // cm 
    largura: 20,     // cm 
    altura: 5,      // cm 
    peso: 0.1,      
    volumeMax: (30 * 20 * 5) / 1000,
  },
  {
    id: 'caixa_g',
    nome: 'Caixa Grande',
    comprimento: 30, // cm 
    largura: 25,     // cm 
    altura: 8,      // cm 
    peso: 0.1,      
    volumeMax: (30 * 25 * 8) / 1000,
  },
  {
    id: 'caixa_gg',
    nome: 'Caixa Extra Grande',
    comprimento: 35, // cm 
    largura: 25,     // cm 
    altura: 10,      // cm 
    peso: 0.15,      
    volumeMax: (35 * 25 * 10) / 1000,
  },
  {
    id: 'caixa_xg',
    nome: 'Caixa Enorme',
    comprimento: 35, // cm 
    largura: 30,     // cm 
    altura: 13,      // cm 
    peso: 0.15,      
    volumeMax: (35 * 30 * 13) / 1000,
  }
];

module.exports = { embalagens };