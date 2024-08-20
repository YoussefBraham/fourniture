import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FournituresAdmin = ({ setFourniture_info }) => {
  const [fournitures, setFournitures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState('prix');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterText, setFilterText] = useState('');
  const [selectedColors, setSelectedColors] = useState({});
  const [showAjouterUnArticle, setShowAjouterUnArticle] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedFournitures = sessionStorage.getItem('fournitures');
        if (cachedFournitures) {
          const parsedFournitures = JSON.parse(cachedFournitures);
          setFournitures(parsedFournitures);
          setCategories([...new Set(parsedFournitures.map((fourniture) => fourniture.category))]);
        } else {
          const response = await axios.get('/produit_fournitures');
          sessionStorage.setItem('fournitures', JSON.stringify(response.data));
          setFournitures(response.data);
          setCategories([...new Set(response.data.map((fourniture) => fourniture.category))]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterFournitures(category, selectedSubcategory, filterText);
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    filterFournitures(selectedCategory, subcategory, filterText);
  };

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterTextChange = (text) => {
    setFilterText(text);
    filterFournitures(selectedCategory, selectedSubcategory, text);
  };

  const filterFournitures = (category, subcategory, text) => {
    try {
      const cachedFournitures = JSON.parse(sessionStorage.getItem('fournitures'));
      if (cachedFournitures) {
        const filteredByCategory = category ? cachedFournitures.filter(fourniture => fourniture.category === category) : cachedFournitures;
        const filteredBySubcategory = subcategory ? filteredByCategory.filter(fourniture => fourniture.subcategory === subcategory) : filteredByCategory;
        const filteredByText = text ? filteredBySubcategory.filter(fourniture => fourniture.nom.toLowerCase().includes(text.toLowerCase())) : filteredBySubcategory;
        setSubcategories([...new Set(filteredByCategory.map(fourniture => fourniture.subcategory))]);
        setFournitures(filteredByText);
      }
    } catch (error) {
      console.error('Error filtering fournitures:', error);
    }
  };

  const handleAddToSelected = (product) => {
    const colors = parseAvailableColors(product.available_colors);
    const selectedColor = selectedColors[product.id] || (colors.length > 0 ? colors[0] : 'No colors available');
    const productWithColor = {
      ...product,
      selectedColor: selectedColor || 'No color available',
    };
    setFourniture_info(productWithColor);
  };

  const parseAvailableColors = (colorsString) => {
    if (colorsString) {
      if (colorsString.includes('http')) {
        return colorsString.split(',').map(entry => entry.split(':')[0].trim());
      }
      return colorsString.split(',').map(color => color.trim());
    }
    console.log('No available colors or color data is missing');
    return [];
  };

  const handleColorChange = (productId, selectedColor) => {
    setSelectedColors(prevColors => ({
      ...prevColors,
      [productId]: selectedColor,
    }));
  };

  const renderColorDropdowns = (colorsString, productId) => {
    const colors = parseAvailableColors(colorsString);
    return (
      <div key={`article-${productId}`} className="mb-4 flex w-full items-center">
        <select
          className="bg-white border border-gray-300 rounded-md p-2 w-full"
          value={selectedColors[productId] || ''}
          onChange={(e) => handleColorChange(productId, e.target.value)}
        >
          {colors.map((color, index) => (
            <option key={index} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const sortedFournitures = [...fournitures].sort((a, b) => {
    if (sortColumn) {
      const first = sortColumn === 'prix' ? parseFloat(a[sortColumn]) : a[sortColumn].toUpperCase();
      const second = sortColumn === 'prix' ? parseFloat(b[sortColumn]) : b[sortColumn].toUpperCase();
      const direction = sortDirection === 'asc' ? 1 : -1;
      return sortColumn === 'prix' ? (first - second) * direction : first.localeCompare(second) * direction;
    }
    return 0;
  });

  const handleAjouterUnProduit = () => {
    setShowAjouterUnArticle(true);
  };

  const handleCloseProductList = () => {
    setShowAjouterUnArticle(false);
  };

  const handleCategorySelectChange = (e) => {
    const category = e.target.value;
    setCategoryAjouterProduit(category);
    const newSubcategories = category ? [...new Set(fournitures.filter(fourniture => fourniture.category === category).map(fourniture => fourniture.subcategory))] : [];
    setSubcategories(newSubcategories);
  };

  const AjouterUnManuelle = (e) => {
    e.preventDefault();
    handleSendToBackend(e);
  };

  const [nom, setNom] = useState('');
  const [marque, setMarque] = useState('');
  const [prix, setPrix] = useState('');
  const [couleur, setCouleur] = useState('');
  const [lienImage, setLienImage] = useState('');
  const [categoryAjouterProduit, setCategoryAjouterProduit] = useState('');
  const [sousCategoryAjouterProduit, setSousCategoryAjouterProduit] = useState('');
  const [lienSource, setLienSource] = useState('');
  const [description, setDescription] = useState('');

  const handleSendToBackend = (e) => {
    e.preventDefault();

    const requestData = {
      nom,
      marque,
      prix,
      couleur,
      lienImage,
      lienSource,
      categoryAjouterProduit,
      sousCategoryAjouterProduit,
      description
    };

    axios.post('/ajouter_produit', requestData)
      .then((response) => {
        console.log('Data sent to backend successfully:', response.data);
        alert('Data sent to backend successfully');
        handleCloseProductList()
      })
      .catch((error) => {
        console.error('Error sending data to backend:', error);
        alert('Error sending data to backend');
      });
  };

  return (
    <div className="flex flex-col w-full m-5 items-center">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
              {showAjouterUnArticle && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 border border-black rounded-lg w-3/4 h-3/4 overflow-y-auto z-50">
          <button
            onClick={handleCloseProductList}
            className="absolute top-2 right-2 text-red-500 px-2 py-1"
          >
            X
          </button>
          <form className="flex flex-col justify-center items-center space-y-4" onSubmit={handleSendToBackend}>
            <h2 className="text-lg font-semibold">Ajouter un Produit</h2>

            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="nom">Nom:</label>
              <input
                id="nom"
                className="w-1/2 border border-black rounded-xl p-2"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
              <span>ENLEVER LES CARACTERES SPECIAUX TYPE virgule, point, point virgule, apostrophe  utiliser seulement le tiret '-'</span>
            </div>

            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="editeur">Marque:</label>
              <input
                id="marque"
                className="w-1/2 border border-black rounded-xl p-2"
                type="text"
                value={marque}
                onChange={(e) => setMarque(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="prix">Prix:</label>
              <input
                id="prix"
                className="w-1/2 border border-black rounded-xl p-2"
                type="text"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                required
              />
            </div>



            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="description">Couleur Disponible:</label>
              <textarea
                id="couleur_disponible"
                className="w-1/2 border border-black rounded-xl p-2"
                value={couleur}
                onChange={(e) => setCouleur(e.target.value)}                                   
              />
            </div>



            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="description">Lien Image:</label>
              <textarea
                id="lien_image"
                className="w-1/2 border border-black rounded-xl p-2"
                value={lienImage}
                onChange={(e) => setLienImage(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="lien_source">Lien Source:</label>
              <input
                id="lien_source"
                className="w-1/2 border border-black rounded-xl p-2"
                type="text"
                value={lienSource}
                onChange={(e) => setLienSource(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="lien_source">Catégorie:</label>

              <select
                id="classe"
                className="w-1/2 border border-black rounded-xl p-2"
                value={categoryAjouterProduit}
                onChange={(e) => handleCategorySelectChange(e)}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
              Categorie Indisponible ? Saisir Manuellement ci dessous:
              <input
                id="category"
                className="w-1/2 border border-black rounded-xl p-2"
                type="text"
                value={categoryAjouterProduit}
                onChange={(e) => setCategoryAjouterProduit(e.target.value)}
                required
              />



            </div>

            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="lien_source">Sous Categorie:</label>
              <select
                id="classe"
                className="w-1/2 border border-black rounded-xl p-2"
                value={sousCategoryAjouterProduit}
                onChange={(e) => setSousCategoryAjouterProduit(e.target.value)} >
                <option value="">Sélectionnez une catégorie</option>
                {subcategories.map((subcategories, index) => (
                  <option key={index} value={subcategories}>{subcategories}</option>
                ))}
              </select>
              Sous-Categorie Indisponible ? Saisir Manuellement ci dessous:

              <input
                id="souscategorie"
                className="w-1/2 border border-black rounded-xl p-2"
                type="text"
                value={sousCategoryAjouterProduit}
                onChange={(e) => setSousCategoryAjouterProduit(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="lien_source">Description:</label>
              <input
                id="description"
                className="w-1/2 border border-black rounded-xl p-2"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                
              />
            </div>


            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Ajouter</button>
          </form>
        </div>
      )}
          <div className="flex flex-col bg-gray-50 w-full justify-center items-center p-1">
              <div className='font-bold'>Fourniture Scolaire</div>
            <div className=" m-3 rounded-2xl">
              <label htmlFor="filterText">Filtrer par nom:</label>
              <input
                id="filterText"
                type="text"
                value={filterText}
                onChange={(e) => handleFilterTextChange(e.target.value)}
              />
            </div>
            <div className="  m-3 rounded-2xl">
              <label htmlFor="category">Filtrer par categorie:</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="all">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="m-3 rounded-2xl">
              <label htmlFor="subcategory">Filtrer par Sous-categorie:</label>
              <select
                id="subcategory"
                value={selectedSubcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
              >
                <option value="all">All</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
            <button
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded mb-5 w-1/3"
          onClick={handleAjouterUnProduit}
        >
          Produit introuvable ? Ajoute le produit !
        </button>
          </div>

          <table className="mt-5">
            <thead>
              <tr>
                <th className="text-left"></th>
                <th className="text-left" onClick={() => handleSort('name')}>
                  Nom
                  {sortColumn === 'name' && (
                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th className="text-left" onClick={() => handleSort('prix')}>
                  Prix
                  {sortColumn === 'prix' && (
                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedFournitures
                .filter((fourniture) => !selectedCategory || fourniture.category === selectedCategory)
                .filter((fourniture) => !selectedSubcategory || fourniture.subcategory === selectedSubcategory || selectedSubcategory === 'all')
                .filter((fourniture) => fourniture.nom.toLowerCase().includes(filterText.toLowerCase()))
                .map((fourniture) => (
                  <tr className="border" key={fourniture.id}>
                    <td className="pr-4">
                      <img src={fourniture.image} alt={fourniture.nom} style={{ maxWidth: '100px', maxHeight: '100px' }} />
                    </td>
                    <td className="text-left">
                      <div className="flex">
                        <div className="mr-5">{fourniture.category}</div>
                        <div>{fourniture.subcategory}</div>
                      </div>
                      <div>{fourniture.name_to_display}</div>
                      {fourniture.available_colors && renderColorDropdowns(fourniture.available_colors, fourniture.id)}
                    </td>
                    <td className="text-left">{fourniture.prix}</td>
                    <td className="text-left pl-5">
                      <button onClick={() => handleAddToSelected(fourniture)}>Add to List</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
      <Link className="mt-10" to="https://www.welcomeoffice.com/guides_achat/classement-et-archivage/42/les-differents-types-de-classeurs.aspx" target="_blank">
        Comprendre dimension Classeur
      </Link>
    </div>
  );
};

export default FournituresAdmin;
