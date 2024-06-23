import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Manuelle = ({ setManuelle_info }) => { // Destructure setManuelle_info directly from props
  const [manuelles, setmanuelles] = useState([]);
  const [ecoles, setEcoles] = useState([]);
  const [dataEcole, setDataEcole] = useState([]);
  const [selectedEcole, setSelectedEcole] = useState('');
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState('prix'); // Sort by price by default
  const [sortDirection, setSortDirection] = useState('desc'); // Descending order by default
  const [filterText, setFilterText] = useState('');
  const [showAjouterUnArticle, setShowAjouterUnArticle] = useState(false);

  useEffect(() => {
    axios.get('/ecoles_2').then((response) => {
      const ecolesData = response.data;
      const nomEcole = ecolesData.map((ecole) => ecole.nom_ecole);
      setEcoles(nomEcole);
      setDataEcole(ecolesData);
    });
  }, []);

  const handleEcoleChange = (event) => {
    const selectedEcoleValue = event.target.value;
    setSelectedEcole(selectedEcoleValue);
    const filteredDataEcole = dataEcole.filter(
      (ecole) => ecole.nom_ecole === selectedEcoleValue
    );
    const nomClasse = filteredDataEcole.map((ecole) => ecole.classe);
    const classesArray = nomClasse
      .map((classeString) => classeString.split(','))
      .flat()
      .map((classe) => classe.trim());
    setClasses(classesArray);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let cachedmanuelles = sessionStorage.getItem('manuelles');
        if (cachedmanuelles) {
          cachedmanuelles = JSON.parse(cachedmanuelles);
          setmanuelles(cachedmanuelles);
          const uniqueCategories = [...new Set(cachedmanuelles.map((manuelle) => manuelle.ecole))];
          setCategories(uniqueCategories);
        } else {
          const response = await axios.get('/produit_manuelles');
          sessionStorage.setItem('manuelles', JSON.stringify(response.data));
          setmanuelles(response.data);
          const uniqueCategories = [...new Set(response.data.map((manuelle) => manuelle.ecole))];
          setCategories(uniqueCategories);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (e) => {
    const ecole = e.target.value;
    setSelectedCategory(ecole);
    try {
      const cachedmanuelles = JSON.parse(sessionStorage.getItem('manuelles'));
      if (cachedmanuelles) {
        const filteredmanuelles = ecole ? cachedmanuelles.filter(manuelle => manuelle.ecole === ecole) : cachedmanuelles;
        const uniqueSubcategories = [...new Set(filteredmanuelles.map(manuelle => manuelle.classe))];
        setSubcategories(uniqueSubcategories);
        sessionStorage.setItem('subcategories', JSON.stringify(uniqueSubcategories));
        setmanuelles(filteredmanuelles);
      }
    } catch (error) {
      console.error('Error filtering manuelles:', error);
    }
  };

  const handleSubcategoryChange = (e) => {
    const classe = e.target.value;
    setSelectedSubcategory(classe);
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
  };

  const sortedmanuelles = useMemo(() => {
    return [...manuelles].sort((a, b) => {
      if (sortColumn === 'prix') {
        const first = parseFloat(a[sortColumn]);
        const second = parseFloat(b[sortColumn]);
        const direction = sortDirection === 'asc' ? 1 : -1;
        return (first - second) * direction;
      } else {
        const first = a[sortColumn].toUpperCase();
        const second = b[sortColumn].toUpperCase();
        const direction = sortDirection === 'asc' ? 1 : -1;
        return first.localeCompare(second) * direction;
      }
    });
  }, [manuelles, sortColumn, sortDirection]);

  const handleAddToSelected = (product) => {
    setManuelle_info(product);
  };

  const handleAjouterUnArticle = () => {
    setShowAjouterUnArticle(true);
  };

  const handleCloseProductList = () => {
    setShowAjouterUnArticle(false);
  };

  const AjouterUnManuelle = (e) => {
    e.preventDefault();
    handleSendToBackend(e);
  };

  const [isbn, setIsbn] = useState('');
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [lienImage, setLienImage] = useState('');
  const [classe, setClasse] = useState('');
  const [matiere, setMatiere] = useState('');
  const [description, setDescription] = useState('');
  const [editeur, setEditeur] = useState('');
  const [lienSource, setLienSource] = useState('');

  const handleSendToBackend = (e) => {
    e.preventDefault();

    const requestData = {
      isbn,
      nom,
      editeur,
      prix,
      lien_image: lienImage,
      ecole: selectedEcole,
      classe,
      description,
      lien_source: lienSource,
    };

    axios.post('/ajouter_manuel', requestData)
      .then((response) => {
        console.log('Data sent to backend successfully:', response.data);
        alert('Data sent to backend successfully');
      })
      .catch((error) => {
        console.error('Error sending data to backend:', error);
        alert('Error sending data to backend');
      });
  };

  return (
    <div className='flex flex-col w-full m-5 items-center'>
      {showAjouterUnArticle && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 border border-black rounded-lg w-3/4 h-3/4 overflow-y-auto z-50">
          <button
            onClick={handleCloseProductList}
            className="absolute top-2 right-2 text-red-500 px-2 py-1"
          >
            X
          </button>
          <form className="flex flex-col justify-center items-center space-y-4" onSubmit={handleSendToBackend}>
            <h2 className="text-lg font-semibold">Ajouter un Manuel</h2>
            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="isbn">ISBN:</label>
              <input
                id="isbn"
                className="w-1/2 border border-black rounded-xl p-2"
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                required
              />
            </div>
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
              <label className="mb-1" htmlFor="editeur">Editeur:</label>
              <input
                id="editeur"
                className="w-1/2 border border-black rounded-xl p-2"
                type="text"
                value={editeur}
                onChange={(e) => setEditeur(e.target.value)}
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
              <label className="mb-1" htmlFor="lien_image">Lien de l'image:</label>
              <input
                id="lien_image"
                className="w-1/2 border border-black rounded-xl p-2"
                type="text"
                value={lienImage}
                onChange={(e) => setLienImage(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="ecole">Ecole:</label>
              <select
                id="ecole"
                className="w-1/2 border border-black rounded-xl p-2"
                value={selectedEcole}
                onChange={handleEcoleChange}
                required
              >
                <option value="">Sélectionnez une école</option>
                {ecoles.map((ecole, index) => (
                  <option key={index} value={ecole}>{ecole}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="classe">Classe:</label>
              <select
                id="classe"
                className="w-1/2 border border-black rounded-xl p-2"
                value={classe}
                onChange={(e) => setClasse(e.target.value)}
                required
              >
                <option value="">Sélectionnez une classe</option>
                {classes.map((classe, index) => (
                  <option key={index} value={classe}>{classe}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-center w-full px-10">
              <label className="mb-1" htmlFor="description">Description:</label>
              <textarea
                id="description"
                className="w-1/2 border border-black rounded-xl p-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Ajouter</button>
          </form>
        </div>
      )}

      <div className="w-full p-4 bg-gray-100">
        <h2 className="text-lg font-semibold">Manuels Scolaires</h2>
        <div className="mb-4">
          <label className="mr-2" htmlFor="filterText">Filtrer par nom:</label>
          <input
            id="filterText"
            type="text"
            value={filterText}
            onChange={(e) => handleFilterTextChange(e.target.value)}
            className="border p-2"
          />
        </div>
        <div className="mb-4">
          <label className="mr-2" htmlFor="filterCategory">Filtrer par école:</label>
          <select
            id="filterCategory"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="border p-2"
          >
            <option value="">Toutes les écoles</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="mr-2" htmlFor="filterSubcategory">Filtrer par classe:</label>
          <select
            id="filterSubcategory"
            value={selectedSubcategory}
            onChange={handleSubcategoryChange}
            className="border p-2"
          >
            <option value="">Toutes les classes</option>
            {subcategories.map((subcategory, index) => (
              <option key={index} value={subcategory}>{subcategory}</option>
            ))}
          </select>
        </div>
        <button
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded mb-5"
          onClick={handleAjouterUnArticle}
        >
          Manuel introuvable ? Ajoute un Manuel !
        </button>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Image</th>
                <th className="py-2 px-4 border-b" onClick={() => handleSort('nom')}>Nom</th>
                <th className="py-2 px-4 border-b" onClick={() => handleSort('prix')}>Prix</th>
                <th className="py-2 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedmanuelles.filter(manuelle => manuelle.nom.toLowerCase().includes(filterText.toLowerCase())).map((manuelle) => (                
                
                <tr key={manuelle.isbn}>
                  {console.log('manuelle',manuelle)}
                  <td className="py-2 px-4 border-b w-min"><img src={manuelle.image} alt={manuelle.nom} className="w-32 h-32 object-cover items-center justify-center" /></td>
                  <td className="py-2 px-4 border-b flex-col w-min">
                    <div>{manuelle.nom}</div>
                    <div>{manuelle.isbn_numeric}</div>
                  </td>
                  
                  <td className="py-2 px-4 border-b">{manuelle.prix}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => handleAddToSelected(manuelle)} className="bg-blue-500 text-white px-4 py-2 rounded">Ajouter</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Manuelle;
