import React from 'react';
import { Outlet } from 'react-router-dom'; // Importe o Outlet!
import NewHeader from './NewHeader'; // Importe o novo cabeçalho
import NewFooter from './NewFooter';
import WhatsAppButton from './WhatsAppButton';

const MainLayout = () => {
  return (
    <>
      <NewHeader />
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Outlet /> 
      </main>
      <NewFooter />
      <WhatsAppButton />
    </>
  );
};

export default MainLayout;