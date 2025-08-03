import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider, ProductProvider } from './contexts';
import useTokenExpiredNotification from './hooks/useTokenExpiredNotification.jsx';


function App() {
  const { NotificationComponent } = useTokenExpiredNotification();

  return (
    <BrowserRouter>
    
      <AuthProvider>
        <ProductProvider>

          <AppRoutes />
          
          {/* Componente global para notificações de token expirado */}
          <NotificationComponent />

        </ProductProvider>
      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;


