import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default function IndexPage() {
  const [ecoles, setEcoles] = useState(['']);
  const [classes, setClasses] = useState(['']);
  const [selectedEcole, setSelectedEcole] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');

  useEffect(() => {
    // Fetch data from your backend API or set initial data
    setEcoles(['ISC Carthage', 'Pierre Mendes France']);
    setClasses(['CM1', 'CM2'])
    
    axios.get('http://localhost:4000/test')

  }, []);
  

  const handleEcoleChange = (event) => {
    setSelectedEcole(event.target.value);
  };

  const handleClasseChange = (event) => {
    setSelectedClasse(event.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-row rounded-xl justify-between items-center w-screen">
        <div className="border p-10 m-5">Les prix les moins chers</div>
        <div className="border p-10 m-5">Livraison a domicile</div>
        <div className="border p-10 m-5">Paiement en ligne ou à la livraison</div>
      </div>


      <div>
        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <label htmlFor="dropdownEcole">'ISC Carthage'</label>
          <select id="dropdownEcole" value={selectedEcole} onChange={handleEcoleChange}>
            <option value="">Choisir une école</option>
            {ecoles.map((ecole, index) => (
              <option key={index} value={ecole}>
                {ecole}
              </option>
            ))}
          </select>
        </div>

        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <label htmlFor="dropdownClasse">Ma classe: </label>
          <select id="dropdownClasse" value={selectedClasse} onChange={handleClasseChange}>
            <option value="">CM1</option>
            {classes.map((classe, index) => (
              <option key={index} value={classe}>
                {classe}
              </option>
            ))}
          </select>
        </div>
      </div>

    </div>
  );
}
