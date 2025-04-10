import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import Header from './components/header.jsx';
import Footer from './components/Footer.jsx';


function App() {
  return (
    <BrowserRouter>

      <Header />
      <AppRoutes />
      <Footer />
      
    </BrowserRouter>
  );
}

export default App;

