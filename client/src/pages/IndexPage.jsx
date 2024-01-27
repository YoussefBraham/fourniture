import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default function IndexPage() {
  const [ecoles, setEcoles] = useState(['']);
  const [dataEcole, setDataeEcole] = useState(['']);
  const [selectedEcole, setSelectedEcole] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState(['']);
  const [listefourniture, setListefourniture] = useState(['']);

  useEffect(() => {
    axios.get('/ecoles').then((response) => {
      const ecolesData = response.data;
      const nom_ecole = ecolesData.map((ecole) => ecole.nom_ecole);
      setEcoles(nom_ecole);
      setDataeEcole(ecolesData);
    });

    axios.get('/all_fourniture_classe', {
    params: {
      classe: selectedClasse,
      ecole: selectedEcole,
    },
  }).then((response) => {
    setListefourniture(response.data);
  });
}, [selectedClasse, selectedEcole]);
  

  const handleEcoleChange = (event) => {
    const selectedEcoleValue = event.target.value;
    setSelectedEcole(selectedEcoleValue);

    const filteredDataEcole = dataEcole.filter((ecole) =>
      ecole.nom_ecole === selectedEcoleValue
    );
    const nom_classe = filteredDataEcole.map((ecole) => ecole.classe);
    const classesArray = nom_classe
        .map((classeString) => classeString.split(','))
        .flat()
        .map((classe) => classe.trim());
      setClasses(classesArray);

  };

  const handleClasseChange = (event) => {
    setSelectedClasse(event.target.value);
  };

  console.log(listefourniture)

  return (
    <div className="flex flex-col items-center justify-center">


      <div>
        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <select id="dropdownEcole" value={selectedEcole} onChange={handleEcoleChange}>
            <option value="">Mon école</option>
            {ecoles.map((ecole, index) => (
              <option key={index} value={ecole}>
                {ecole}
              </option>
            ))}
          </select>
        </div>

       <div className="p-2 m-4 border rounded-xl border-gray-600">
          <select id="dropdownClasse" value={selectedClasse} onChange={handleClasseChange}>
          <option value="">Ma classe</option>
            {classes.map((classe, index) => (
              <option key={index} value={classe}>
                {classe}
              </option>
            ))}
          </select>
        </div>
      </div>

       <div className="border flex-col rounded-xl p-10 justify-between items-center">
        <div className=''> Prix</div>
        <button className="border flex-col rounded-xl" > Commander la liste</button>       
      </div>

      <div className='border mt-10 w-2/3'> 
      <div>Ma Liste</div>
      <div className='border rounded-xl'> 
      <div className='text-left'> Matiere</div>
      <div className='flex flex-row'>
      <div className='m-3 bg-gray-200'> photo</div>
      <div className='m-3'> description</div>
      <div className='m-3'> price</div>
      <div className='m-3'> quantity</div>
      </div>
      </div>
      </div>


      <div className="flex flex-row rounded-xl justify-between items-center w-screen">
        <div className="border p-10 m-5">Les prix les moins chers</div>
        <div className="border p-10 m-5">Livraison a domicile</div>
        <div className="border p-10 m-5">Paiement en ligne ou à la livraison</div>
      </div>
    </div>
  );
}
