import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import WhatsAppButton from "./components/WhatsAppButton";  // Importando o botão do WhatsApp
import { CarrinhoProvider } from './context/CarrinhoContext.jsx';


function App() {
  return (
    <CarrinhoProvider>
      <BrowserRouter>


        <AppRoutes />



        <WhatsAppButton /> {/* Adicionando o botão flutuante do WhatsApp */}
      </BrowserRouter>
    </CarrinhoProvider> 
  );
}

export default App;


