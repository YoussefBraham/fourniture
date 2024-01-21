import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import IndexPage from "./pages/IndexPage.jsx";
import Panier from "./pages/panier.jsx";
import Compte from "./pages/compte.jsx";

import Layout from "./Layout"


function App() {
  return (
    <BrowserRouter>
      <Routes>
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
