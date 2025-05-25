import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import WhatsAppButton from "./components/WhatsAppButton";  // Importando o botão do WhatsApp
import { CarrinhoProvider } from './context/CarrinhoContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';


function App() {
  return (
    <CarrinhoProvider>
      <BrowserRouter>

        {/* <Header /> */}

        <AppRoutes />

        {/* <Footer /> */}


        <WhatsAppButton /> {/* Adicionando o botão flutuante do WhatsApp */}
      </BrowserRouter>
    </CarrinhoProvider> 
  );
}

export default App;


