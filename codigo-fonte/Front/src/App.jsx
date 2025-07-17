import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider, ProductProvider } from './contexts';


function App() {
  return (
    <BrowserRouter>
    
      <AuthProvider>
        <ProductProvider>


          <AppRoutes />



        </ProductProvider>
      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;


