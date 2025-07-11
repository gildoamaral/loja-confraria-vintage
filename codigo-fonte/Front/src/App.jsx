import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import WhatsAppButton from "./components/WhatsAppButton";  // Importando o botão do WhatsApp
import { AuthProvider, ProductProvider } from './contexts';


function App() {
  return (
    <BrowserRouter>
    
      <AuthProvider>
        <ProductProvider>


          <AppRoutes />

          <WhatsAppButton />


        </ProductProvider>
      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;


