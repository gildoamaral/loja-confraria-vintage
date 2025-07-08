import React from 'react';
import { Outlet } from 'react-router-dom'; // Importe o Outlet!
import NewHeader from './NewHeader'; // Importe o novo cabeçalho
import NewFooter from './NewFooter';
// import Footer from '../components/Footer'; // Você também poderia adicionar um rodapé aqui

const MainLayout = () => {
  return (
    <>
      <NewHeader />
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* O Outlet renderiza o componente da rota filha aqui */}
        <Outlet /> 
      </main>
      <NewFooter />
      {/* <Footer /> */}
    </>
  );
};

export default MainLayout;