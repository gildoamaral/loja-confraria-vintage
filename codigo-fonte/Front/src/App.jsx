import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import WhatsAppButton from "./components/WhatsAppButton";  // Importando o botão do WhatsApp


function App() {
  return (
      <BrowserRouter>


        <AppRoutes />



        <WhatsAppButton /> {/* Adicionando o botão flutuante do WhatsApp */}
      </BrowserRouter>
  );
}

export default App;


