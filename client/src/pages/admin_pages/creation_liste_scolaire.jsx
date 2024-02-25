import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Products from './products.jsx'

export default function CreationListeScolaire() {
  const [ecoles, setEcoles] = useState([]);
  const [dataEcole, setDataEcole] = useState([]);
  const [selectedEcole, setSelectedEcole] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // New state for selected items
  const matieres = ["Francais", 'Histoire-Geo', 'S.V.T.','Arabe','Mathématique','Musique', 'Arts plastiques', 'Anglais', 'Technologie']
  const [itemList, setItemList] = useState([]); // Define itemList and setItemList states


// fetching ecole list
  useEffect(() => {
    axios.get('/ecoles').then((response) => {
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

  const handleClasseChange = (event) => {
    setSelectedClasse(event.target.value);
  };

  const handleMatiereChange = (event) => {
    setSelectedMatiere(event.target.value);
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


const handleDataFromChild = (data) => {
  setItemList(data);
};


  return (
    <div className="flex flex-col items-center justify-center border rounded-2xl">

      <div className='flex'>
        {/*Select ecole*/}
        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <select
            id="dropdownEcole"
            value={selectedEcole}
            onChange={handleEcoleChange}
          >
            <option value="">Ecole</option>
            {ecoles.map((ecole, index) => (
              <option key={index} value={ecole}>
                {ecole}
              </option>
            ))}
          </select>
        </div>

        {/*Select classe*/}
        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <select
            id="dropdownClasse"
            value={selectedClasse}
            onChange={handleClasseChange}
          >
            <option value="">Classe</option>
            {classes.map((classe, index) => (
              <option key={index} value={classe}>
                {classe}
              </option>
            ))}
          </select>
        </div>

        {/*Select matiere*/}
        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <select
            id="dropdownClasse"
            value={selectedMatiere}
            onChange={handleMatiereChange}
          >
            <option value=""> Matiere</option>
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
        </ul>
          <ul>


      </ul>
  </div>

  <button onClick={handleSendToBackend}>Send to Backend</button>




      <Products fourniturelist2={handleDataFromChild} />
    </div>
  );
}
