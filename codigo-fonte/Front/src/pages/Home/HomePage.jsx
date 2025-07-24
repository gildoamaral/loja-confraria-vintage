import Carrossel from '../../components/Carrossel';
import CulturaVintage from '../../components/CulturaVintage';
import CategoriasDestaque from './components/CategoriasDestaque';
import ProdutosDestaque from './components/ProdutosDestaque';



const HomePage = () => {


  return (
    <>
      <Carrossel />

      <CategoriasDestaque />

      <ProdutosDestaque />

      <CulturaVintage />
    </>
  );
};

export default HomePage;