import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreationListeScolaire() {
  const [ecoles, setEcoles] = useState([]);
  const [dataEcole, setDataEcole] = useState([]);
  const [selectedEcole, setSelectedEcole] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState([]);
  const [fournitures, setFournitures] = useState([]);
  const [quantityMap, setQuantityMap] = useState({});
  const [filterType, setFilterType] = useState('');
  const [filterName, setFilterName] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // New state for selected items
  const matieres = ["Francais", 'Histoire-Geo', 'S.V.T.','Arabe','Mathématique','Musique', 'Arts plastiques', 'Anglais', 'Technologie']


  useEffect(() => {
    axios.get('/ecoles').then((response) => {
      const ecolesData = response.data;
      const nomEcole = ecolesData.map((ecole) => ecole.nom_ecole);
      setEcoles(nomEcole);
      setDataEcole(ecolesData);
    });

    axios.get('/fournitures').then((response) => {
      const initialQuantityMap = response.data.reduce((map, fourniture) => {
        map[fourniture.id] = 1;
        return map;
      }, {});
      setQuantityMap(initialQuantityMap);

      setFournitures(response.data);
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

  const handleClasseChange = (event) => {
    setSelectedClasse(event.target.value);
  };

  const handleMatiereChange = (event) => {
    setSelectedMatiere(event.target.value);
  };

  const handleQuantityChange = (fournitureId, newQuantity) => {
    setQuantityMap((prevQuantityMap) => ({
      ...prevQuantityMap,
      [fournitureId]: newQuantity,
    }));
  };

  const handleTypeFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleNameFilterChange = (event) => {
    setFilterName(event.target.value);
  };

  const filterTypeLower = filterType.toLowerCase();
  const filterNameLower = filterName.toLowerCase();
  
  const filteredFournitures = fournitures.filter(
    (fourniture) =>
      fourniture.type.toLowerCase().includes(filterTypeLower) &&
      fourniture.name.toLowerCase().includes(filterNameLower)
  );

  const handleAjouterClick = (fournitureId) => {
    const selectedQuantity = quantityMap[fournitureId];
    const selectedFourniture = fournitures.find((fourniture) => fourniture.id === fournitureId);

    const existingItem = selectedItems.find((item) => item.id === fournitureId);

    if (selectedQuantity > 0 && selectedFourniture) {
      if (existingItem) {
        // If the fourniture already exists, update the quantity
        setSelectedItems((prevSelectedItems) =>
          prevSelectedItems.map((item) =>
            item.id === fournitureId
              ? { ...item, quantity: item.quantity + selectedQuantity }
              : item
          )
        );
      } else {
        // If the fourniture doesn't exist, add a new item
        setSelectedItems((prevSelectedItems) => [
          ...prevSelectedItems,
          { id: fournitureId, quantity: selectedQuantity, ...selectedFourniture },
        ]);
      }
    }
  };

  const handleRemoveClick = (fournitureId) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.filter((item) => item.id !== fournitureId)
    );
  };

  const handleSendToBackend = () => {
    // Prepare data to be sent to the backend
    const requestData = {
      ecole: selectedEcole,
      classe: selectedClasse,
      matiere: selectedMatiere,
      selectedItems: selectedItems,
    };

    // Make an HTTP request to send the data to your backend
    axios.post('/creation_liste', requestData)
      .then((response) => {
        console.log('Data sent to backend successfully:', response.data);
        // Optionally, you can handle success (e.g., show a success message)
      })
      .catch((error) => {
        console.error('Error sending data to backend:', error);
        // Optionally, you can handle errors (e.g., show an error message)
      });
  };
  

  return (
    <div className="flex flex-col items-center justify-center">

      <div>
        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <select
            id="dropdownEcole"
            value={selectedEcole}
            onChange={handleEcoleChange}
          >
            <option value="">Saisir école</option>
            {ecoles.map((ecole, index) => (
              <option key={index} value={ecole}>
                {ecole}
              </option>
            ))}
          </select>
        </div>

        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <select
            id="dropdownClasse"
            value={selectedClasse}
            onChange={handleClasseChange}
          >
            <option value="">Saisir classe</option>
            {classes.map((classe, index) => (
              <option key={index} value={classe}>
                {classe}
              </option>
            ))}
          </select>
        </div>


        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <select
            id="dropdownClasse"
            value={selectedMatiere}
            onChange={handleMatiereChange}
          >
            <option value="">Saisir classe</option>
            {matieres.map((matiere, index) => (
              <option key={index} value={matiere}>
                {matiere}
              </option>
            ))}
          </select>
        </div>


      </div>

      <div className="m-4 p-2 border rounded-xl border-gray-600">
    <p>Selected Ecole: {selectedEcole}</p>
    <p>Selected Classe: {selectedClasse}</p>
    <p>Selected Matiere: {selectedMatiere}</p>
    <p>Selected fournitures:</p>
    <ul>
        {selectedItems.map((item) => (
          <li key={item.id}>
            {item.name} - Quantity: {item.quantity}
            <button onClick={() => handleRemoveClick(item.id)}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="red"
              >
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                  fill="black"
                  d="M18 6L6 18h12V6zm-1.41 10.59L12 12.41l-4.59 4.58-1.42-1.42L10.59 12 6 7.41 7.41 6 12 10.59l4.59-4.58 1.42 1.42L13.41 12l4.59 4.59-1.42 1.42z"
                />
              </svg>

            </button>
          </li>
        ))}
      </ul>
  </div>

  <button onClick={handleSendToBackend}>Send to Backend</button>


      <table className="border-collapse mt-4 w-2/3">
        <thead>
          <tr>
            <th className="border p-2">Photo</th>
            <th className="border p-2">Name
            <div className=" border rounded-xl border-gray-600">
        <input className="w-2/3"
          type="text"
          placeholder="Filter"
          value={filterName}
          onChange={handleNameFilterChange}
        />
      </div>
            </th>
            <th className="border p-2">Type
            
      <div className=" border rounded-xl border-gray-600">
        <input className="w-2/3"
          type="text"
          placeholder="Filter"
          value={filterType}
          onChange={handleTypeFilterChange}
        />
      </div></th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredFournitures.map((fourniture) => (
            <tr key={fourniture.id}>
              <td className="border p-2">
                <img
                  src={fourniture.photo}
                  alt={fourniture.name}
                  style={{ width: '50px', height: '50px' }}
                />
              </td>
              <td className="border p-2">{fourniture.name}</td>
              <td className="border p-2">{fourniture.type}</td>
              <td className="border p-2">{fourniture.price}</td>
              <td className="border p-2">
                <input
                  type="number"
                  min="1"
                  value={quantityMap[fourniture.id]}
                  onChange={(e) =>
                    handleQuantityChange(
                      fourniture.id,
                      parseInt(e.target.value, 10)
                    )
                  }
                />
              </td>
              <td className="border p-2">
                <button onClick={() => handleAjouterClick(fourniture.id)}>
                  Ajouter
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
