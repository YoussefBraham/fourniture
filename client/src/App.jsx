import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import IndexPage from './pages/IndexPage.jsx';
import Panier from './pages/panier.jsx';
import Compte from './pages/compte.jsx';
import Admin from './pages/admin_pages/admin.jsx';
import Layout from './Layout';
import Login from './pages/login';
import Address from './pages/address';
import Checkout from './pages/checkout';
import Products from './pages/admin_pages/products.jsx';
import VenteLivres from './pages/ventesLivres.jsx';
import Carriere from './pages/carriere.jsx';
import Contact from './pages/contact.jsx';
import LivraisonDomicile from './pages/livraisonDomicile.jsx';
import MoyenPaiement from './pages/moyenPaiement.jsx';
import ProduitQualite from './pages/produitsQualite.jsx';
import QuiSommesNous from './pages/quiSommeNous.jsx';
import FourniturePage from './pages/produit/fourniture.jsx';
import ManuellePage from './pages/produit/manuelle.jsx';


import axios from 'axios';

// Check if the environment is production or development
const isProduction = process.env.NODE_ENV === 'production';
const baseURL = isProduction
  ? 'https://us-central1-founitures-6f03c.cloudfunctions.net/api'
  : 'http://localhost:4000';

axios.defaults.baseURL = baseURL;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/:subpage?" element={<Admin />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/panier" element={<Panier />} />
          <Route path="/compte" element={<Compte />} />
          <Route path="/address" element={<Address />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/products" element={<Products />} />
          <Route path="/venteLivres" element={<VenteLivres />} />
          <Route path="/Carriere" element={<Carriere />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/LivraisonDomicile" element={<LivraisonDomicile />} />
          <Route path="/MoyenPaiement" element={<MoyenPaiement />} />
          <Route path="/ProduitQualite" element={<ProduitQualite />} />
          <Route path="/QuiSommesNous" element={<QuiSommesNous />} />
          <Route path="/Produits/Manuelle/:fourniture_id" element={<ManuellePage />} />
          <Route path="/Produits/Fourniture/:fourniture_id" element={<FourniturePage />} />


        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
