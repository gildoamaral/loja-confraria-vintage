import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import WhatsAppButton from "./components/WhatsAppButton";  // Importando o botão do WhatsApp

// import Footer from './components/Footer.jsx';
// import Header from './components/header.jsx';

function App() {
  return (
    <BrowserRouter>
      {/* <Header /> */}
      <AppRoutes />
      {/* <Footer /> */}
      
      {/* Adicionando o botão flutuante do WhatsApp */}
      <WhatsAppButton /> 
    </BrowserRouter>
  );
}

export default App;


