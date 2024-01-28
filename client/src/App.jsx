import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import IndexPage from "./pages/IndexPage.jsx";
import Panier from "./pages/panier.jsx";
import Compte from "./pages/compte.jsx";
import Admin from "./pages/admin_pages/admin.jsx";
import Layout from "./Layout"
import axios from 'axios';


axios.defaults.baseURL = 'https://us-central1-founitures-6f03c.cloudfunctions.net/api';


function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/admin/:subpage?" element={<Admin />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/panier" element={<Panier />} />
          <Route path="/compte" element={<Compte />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
