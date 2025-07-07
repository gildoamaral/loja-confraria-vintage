import React from 'react';
import { Outlet } from 'react-router-dom'; // Importe o Outlet!
import NewHeader from './NewHeader'; // Importe o novo cabeçalho
// import Footer from '../components/Footer'; // Você também poderia adicionar um rodapé aqui

const MainLayout = () => {
  return (
    <>
      <NewHeader />
      <main>
        {/* O Outlet renderiza o componente da rota filha aqui */}
        <Outlet /> 
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default MainLayout;