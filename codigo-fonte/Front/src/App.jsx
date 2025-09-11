import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider, ProductProvider } from './contexts';
import useTokenExpiredNotification from './hooks/useTokenExpiredNotification.jsx';
import useColdStartDetection from './hooks/useColdStartDetection.jsx';
import ColdStartModal from './components/ColdStartModal.jsx';


function App() {
  const { NotificationComponent } = useTokenExpiredNotification();
  const {
    isColdStart,
    isConnecting,
    attempts,
    progress,
    showRetryButton,
    retryConnection,
    isServerOnline,
    maxAttempts
  } = useColdStartDetection();

  return (
    <BrowserRouter>
    
      <AuthProvider>
        <ProductProvider>

          <AppRoutes />
          
          {/* Componente global para notificações de token expirado */}
          <NotificationComponent />

          {/* Modal de Cold Start */}
          <ColdStartModal
            isVisible={isColdStart}
            progress={progress}
            attempts={attempts}
            maxAttempts={maxAttempts}
            isConnecting={isConnecting}
            showRetryButton={showRetryButton}
            isServerOnline={isServerOnline}
            onRetry={retryConnection}
          />

        </ProductProvider>
      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;


