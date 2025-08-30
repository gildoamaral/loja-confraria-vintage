# Gerenciamento de Tokens do Melhor Envio

Este sistema gerencia automaticamente os tokens de acesso do Melhor Envio, garantindo que sempre haja um token válido para as requisições da API.

## Como Funciona

### 1. Armazenamento no Banco
- Os tokens são armazenados na tabela `MelhorEnvioAuth`
- Existe apenas um registro (ID fixo = 1)
- Campos: `accessToken`, `refreshToken`, `expiresIn`, `updatedAt`

### 2. Renovação Automática
- Tokens do Melhor Envio duram 30 dias (2.592.000 segundos)
- O sistema verifica automaticamente se o token está expirado
- Se expirado, usa o `refreshToken` para obter um novo `accessToken`
- Atualiza automaticamente o banco com os novos tokens

## Uso

### No Código
```javascript
const { getValidAccessToken } = require('../services/melhorEnvioAuthService.js');

// Obtém um token válido (renova automaticamente se necessário)
const token = await getValidAccessToken();

// Use o token na requisição
const response = await axios.post(url, data, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Rotas de Administração
- `GET /api/melhor-envio-token/info` - Informações sobre o token atual
- `GET /api/melhor-envio-token/validate` - Valida e obtém token válido
- `POST /api/melhor-envio-token/refresh` - Força renovação do token

## Variáveis de Ambiente Necessárias

```env
# URLs e credenciais do Melhor Envio
MELHOR_ENVIO_ORIGIN=https://melhorenvio.com.br
MELHOR_ENVIO_USER_ID=seu_user_id
MELHOR_ENVIO_SECRET=seu_client_secret

# Tokens iniciais (usados apenas na primeira inicialização)
MELHOR_ENVIO_ACCESS_TOKEN=token_inicial
MELHOR_ENVIO_REFRESH_TOKEN=refresh_inicial
```

## Scripts

### Inicialização
```bash
node scripts/initializeMelhorEnvioTokens.js
```
- Migra tokens do `.env` para o banco de dados
- Executa apenas na primeira vez ou quando não há tokens no banco

## Vantagens do Sistema

1. **Renovação Automática**: Nunca mais tokens expirados
2. **Centralizado**: Todos os serviços usam o mesmo token válido
3. **Monitoramento**: Rotas admin para verificar status dos tokens
4. **Fallback**: Se a renovação falhar, usa tokens do `.env` como backup
5. **Logs**: Sistema completo de logs para debugging

## Logs do Sistema

O sistema registra automaticamente:
- Quando um token é obtido do banco
- Quando um token está expirado
- Processo de renovação
- Erros de renovação
- Fallbacks utilizados

## Exemplo de Response das Rotas Admin

### GET /api/melhor-envio-token/info
```json
{
  "hasToken": true,
  "isExpired": false,
  "tokenAge": "2 dias, 5 horas",
  "timeUntilExpiry": "27 dias, 18 horas", 
  "lastUpdated": "2025-08-28T22:30:33.966Z",
  "expiresInSeconds": 2592000
}
```

### POST /api/melhor-envio-token/refresh
```json
{
  "message": "Token renovado com sucesso",
  "success": true,
  "tokenPreview": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

## Troubleshooting

### Token não renova
1. Verifique se `MELHOR_ENVIO_USER_ID` e `MELHOR_ENVIO_SECRET` estão corretos
2. Verifique se o `refreshToken` no banco ainda é válido
3. Execute `POST /api/melhor-envio-token/refresh` manualmente

### Primeira inicialização
1. Certifique-se que `MELHOR_ENVIO_ACCESS_TOKEN` e `MELHOR_ENVIO_REFRESH_TOKEN` estão no `.env`
2. Execute o script: `node scripts/initializeMelhorEnvioTokens.js`

### Verificar status
1. Use `GET /api/melhor-envio-token/info` para verificar status atual
2. Logs do sistema mostram todas as operações
