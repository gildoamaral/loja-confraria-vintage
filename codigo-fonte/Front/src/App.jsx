import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />  {}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

