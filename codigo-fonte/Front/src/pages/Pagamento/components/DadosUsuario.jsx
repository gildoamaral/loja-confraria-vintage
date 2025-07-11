import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider
} from '@mui/material';

const DadosUsuario = ({ usuario, enderecoLinha }) => {
  return (
    <Card sx={{ mb: 3, background: '#FFF7F2', borderRadius: 2, width: '100%' }}>
      <CardContent>
        {usuario && (
          <>
            <Typography variant="h6" gutterBottom fontWeight={700}>Dados do Usuário</Typography>
            <Typography variant="body2">Nome: <b>{usuario.nome} {usuario.sobrenome}</b></Typography>
            <Typography variant="body2">E-mail: <b>{usuario.email}</b></Typography>
            <Divider sx={{ my: 2 }} />
          </>
        )}
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Endereço de Entrega
        </Typography>
        <Typography variant="body2">
          {enderecoLinha}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DadosUsuario;
