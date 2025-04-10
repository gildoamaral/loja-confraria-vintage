import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import logo from "./assets/image-Photoroom.png";

function App() {
  return (
    <BrowserRouter>
      <img src={logo} alt="Logo" style={{ width: "40em", margin: "20px" }} />
      <Navbar />  {}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

