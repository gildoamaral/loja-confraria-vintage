import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";

// import Footer from './components/Footer.jsx';
// import Header from './components/header.jsx';



function App() {
  return (
    <BrowserRouter>

      {/* <Header /> */}
      <AppRoutes />
      {/* <Footer /> */}
      
    </BrowserRouter>
  );
}

export default App;

