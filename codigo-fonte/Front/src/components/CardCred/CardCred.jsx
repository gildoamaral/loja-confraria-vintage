import React from 'react'
import { Box, Checkbox, FormControlLabel, Typography, Grid, FormLabel, OutlinedInput, FormControl } from '@mui/material'
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import SimCardRoundedIcon from '@mui/icons-material/SimCardRounded';

const CardCred = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: 'background.paper',
      }}
      maxWidth='460px'
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 3,
          height: { xs: 300, sm: 350, md: 375 },
          width: '100%',
          borderRadius: "20px",
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2"> Cartão de Crédito </Typography>
          <CreditCardRoundedIcon sx={{ color: 'text.secondary' }} />
        </Box>
        <SimCardRoundedIcon
          sx={{
            fontSize: { xs: 48, sm: 56 },
            transform: "rotate(90deg)",
            color: 'text.secondary',
          }}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl sx={{ flexGrow: 1 }} >
            <FormLabel htmlFor="card-number" required>
              Número do cartão
            </FormLabel>
            <OutlinedInput
              id="card-number"
              autoComplete="card-number"
              placeholder='0000 0000 0000 0000'
              required
            // value={cardNumber}
            // onChange={handleCardNumberChange}
            />
          </FormControl>
          <FormControl sx={{ maxWidth: "20%" }} >
            <FormLabel htmlFor="cvv" required>
              CVV
            </FormLabel>
            <OutlinedInput
              id="cvv"
              autoComplete="CVV"
              placeholder='123'
              required
            // value={cvv}
            // onChange={handleCvvChange}
            />
          </FormControl>
        </Box>

        <Box
          sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ flexGrow: 1 }} >
            <FormLabel htmlFor="card-name" required>
              Nome
            </FormLabel>
            <OutlinedInput
              id="card-name"
              autoComplete="card-name"
              placeholder='Nome completo'
              required
            // value={cardName}
            // onChange={handleCardNameChange}
            />
          </FormControl>
          <FormControl sx={{ flexGrow: 1 }} >
            <FormLabel htmlFor="expiration-date" required>
              Data de validade
            </FormLabel>
            <OutlinedInput
              id="expiration-date"
              autoComplete="expiration-date"
              placeholder='MM/AA'
              required
            // value={expirationDate}
            // onChange={handleExpirationDateChange}
            />
          </FormControl>
        </Box>

        <FormControlLabel
          control={<Checkbox name="saveCard" />}
          label="Lembrar dados do cartão na proxima compra"
        />
      </Box>
    </Box>
  )
}

export default CardCred