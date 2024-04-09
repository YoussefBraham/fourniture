import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Fournitures_admin from './components/fournitures_admin.jsx';
import Manuelles_admin from './components/manuelles_admin.jsx';


export default function CreationListeScolaire() {
  const [ecoles, setEcoles] = useState([]);
  const [dataEcole, setDataEcole] = useState([]);
  const [selectedEcole, setSelectedEcole] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [directingToSimilarProduct, setDirectingToSimilarProduct] = useState(false);
  const [similarItemIndex, setSimilarItemIndex] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [loadedliste, setloadedliste] = useState([]);


  const [showFournitures, setShowFournitures] = useState(false);

  const toggleFournitures = () => {
    setShowFournitures(!showFournitures);
  };
  const matieres = [
    'Français',
    'Histoire-Geo',
    'S.V.T.',
    'Arabe',
    'Mathématique',
    'Musique',
    'Arts plastiques',
    'Anglais',
    'Technologie',
    'Arabe',
    'Physique Chimie',
    'Fournitures Scolaire',
    'Trousse & petites fournitures',
    'Questionner le Monde'
    ];

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

  function removeCircularReferences(obj) {
    const seenObjects = new WeakSet();
    function detect(obj) {
      if (obj && typeof obj === 'object') {
        if (seenObjects.has(obj)) {
          return true; // Circular reference detected
        }
        seenObjects.add(obj);
        for (const key in obj) {
          if (obj.hasOwnProperty(key) && detect(obj[key])) {
            delete obj[key]; // Remove circular reference
            // Or handle it in another way, e.g., replace it with a string indicating a circular reference was removed
          }
        }
      }
      return false;
    }
  
    detect(obj);
    return obj;
  }

  const handleSendToBackend = () => {
    // Prepare data to be sent to the backend
    const requestData = {
      ecole: selectedEcole,
      classe: selectedClasse,
      matiere: selectedMatiere,
      selectedItems: removeCircularReferences([...selectedItems])

    };

    // Make an HTTP request to send the data to your backend
    axios
      .post('/creation_liste', requestData)
      .then((response) => {
        console.log('Data sent to backend successfully:', response.data);
        // Optionally, you can handle success (e.g., show a success message)
        alert('Data sent to backend successfully')
      })
      .catch((error) => {
        console.error('Error sending data to backend:', error);
        alert(error)
        // Optionally, you can handle errors (e.g., show an error message)
      });
  };

  const handleDataFromChild = (data) => {
    if (directingToSimilarProduct) {
        const selectedIndex = similarItemIndex; // Assuming similarItemIndex is the index received from the button AddSimilarProduct
        setSelectedItems(prevItems => {
            const updatedItems = [...prevItems];
            if (updatedItems[selectedIndex]) {
                // If selectedItem at the selectedIndex exists, add the data to its similarItems
                updatedItems[selectedIndex].similarItems = [...(updatedItems[selectedIndex].similarItems || []), data];
            }
            return updatedItems;
        });
        setDirectingToSimilarProduct(false); // Reset the flag after processing

    } else {
        // If directingToSimilarProduct is false, add the data to selectedItems
        setSelectedItems(prevItems => [...prevItems, data]);
    }
    setDirectingToSimilarProduct(false);
};

  const handleRemoveItem = (index) => {
    setSelectedItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const AddSimilarProduct = (index ) => {
    setSimilarItemIndex(index)
    setDirectingToSimilarProduct(true);
    

  };

// Define a function to handle quantity changes
const handleQuantityChange = (index, event) => {
  const { value } = event.target;
  // Ensure the value is a positive integer
  const quantity = parseInt(value, 10);
  if (!isNaN(quantity) && quantity >= 1) { // Modify the condition to ensure quantity is greater than or equal to 1
    // Update the quantity of the selected item
    setSelectedItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems[index].quantity = quantity;
      return updatedItems;
    });
  }
};

// Function to open modal and set selected image URL
const openModal = (imageUrl) => {
  setSelectedImageUrl(imageUrl);
  setShowModal(true);
};

// Function to close modal
const closeModal = () => {
  setSelectedImageUrl('');
  setShowModal(false);
};

useEffect(() => {
  if (selectedEcole && selectedClasse && selectedMatiere) {
    axios.get('/fournitures_by_selection', {
      params: {
        ecole: selectedEcole,
        classe: selectedClasse,
        matiere: selectedMatiere
      }
    })
    .then((response) => {
      setloadedliste(response.data)
            // Handle the fetched data
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }
}, [selectedEcole,selectedMatiere]);

useEffect(() => {
  if (loadedliste) {
    const cleanedData = loadedliste.map((matiere) => {
      if (matiere.fourniture_list !== undefined) {
        const stringWithoutFirstTwo = matiere.fourniture_list.slice(2);
        const stringWithoutLastTwo = stringWithoutFirstTwo.slice(0, -2);
        const test = stringWithoutLastTwo.split('","');

        const parsedItems = test.map((list) => JSON.parse(list.replace(/\\/g, '')));

        return {
          nom_ecole: matiere.nom_ecole,
          nom_classe: matiere.nom_classe,
          nom_matiere: matiere.nom_matiere,
          fourniture_list: parsedItems,
        };
      }
      return null; // or handle the case when fourniture_list is undefined
    });
    // Ensure cleanedData has at least one element before accessing its first element
    if (cleanedData.length > 0) {
      setSelectedItems(cleanedData[0].fourniture_list);
    } else {
      setSelectedItems([]);
    }
  } else {
    setSelectedItems([]);
  }
}, [loadedliste]);



console.log('loadedliste',loadedliste)

return (
    <div className="flex flex-col items-center justify-center border rounded-2xl">
      <div className="flex">
        {/*Select ecole*/}
        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <select
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
            value={selectedMatiere}
            onChange={handleMatiereChange}
          >
            <option value="">Matiere</option>
            {matieres.map((matiere, index) => (
              <option key={index} value={matiere}>
                {matiere}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="m-4 p-2 border rounded-xl border-gray-600 w-full flex flex-col items-center justify-between">
        <p>Selected Ecole: {selectedEcole}</p>
        <p>Selected Classe: {selectedClasse}</p>
        <p>Selected Matiere: {selectedMatiere}</p>
        <p>Selected fournitures: </p>
        {selectedItems ? (
    <ul>
           <table className="border-collapse border">
  <thead>
    <tr className="border-b">
      <th className="border-r p-2 text-left">Picture</th>
      <th className="border-r p-2 text-left">Name</th>
      <th className="border-r p-2 text-left">Quantity</th>
      <th className="border-r p-2 text-left">Price</th>
      <th className="p-2 text-left border">Actions</th>
      <th className="p-2 text-left">Similar products</th>

    </tr>
  </thead>
  <tbody>
  {selectedItems && selectedItems.map((item, index) => {
  if (!item || !item.id) return null; // This line ensures that item and item.id are not null or undefined
  return (
    <tr className="border-b" key={index}>
      <td className="border-r p-2">
        <img  src={item.id.charAt(0) === 'M' ? item.image : item.product_picture} alt={item.id.charAt(0) === 'M' ? item.nom : item.name_to_display} style={{ maxWidth: '100px', maxHeight: '100px' }} />        
      </td>
      <td className="border-r p-2">
        <div className="flex flex-col">
          <div className="text-left">{item.id.charAt(0) === 'M' ? item.nom : item.name_to_display}</div>
          {item.available_colors ? (<div className="text-left">Available colors: {item.available_colors}</div>) : (<></>)}
        </div>
      </td>
      <td className="border-r p-2 text-left">
        <input className=''
          type="number"
          min="1" // Set min attribute to ensure quantity is greater than or equal to 1
          value={item.quantity || 1} // Set default value to 1
          onChange={(event) => handleQuantityChange(index, event)}
        />
      </td>
      <td className="border-r p-2 text-left flex flex-col">
        <div>Price per unit: {item.price}</div>
        <div>Total price: {item.price * (item.quantity || 1)}</div>
      </td>
      <td className="p-2 border-r">
        <div className="flex flex-col items-center">
          <button className="border rounded p-1 m-1" onClick={() => handleRemoveItem(index)}>Remove</button>
          <button className={`border rounded p-1 m-1 ${directingToSimilarProduct ? 'bg-blue-500' : ''}`} onClick={() => AddSimilarProduct(index)}>Add a Similar Product</button>
        </div>
      </td>
      <td className="border-r p-2 text-left">
        {item.similarItems ? (
          <div>
            <p className="text-left">Similar Items:</p>
            {item.similarItems.map((similarItem, similarIndex) => (
              <div className='flex' key={similarIndex}>
                <p className="text-left mr-4">{similarItem.id}</p>
                <p className="text-left">{similarItem.price} dt</p>
              </div>
            ))}
          </div>
        ) : (<></>)}
      </td>
    </tr>
  );
})}


  </tbody>
</table>
    </ul>
  ) : (
    <p>No items selected</p>
  )}
      </div>

      <button className="border p-3 rounded-2xl" onClick={handleSendToBackend}>
        Send to Backend
      </button>

 {/* Button to toggle visibility of child component's content */}
{/* Buttons to toggle visibility of components */}

<button className="border p-3 rounded-2xl mt-10" onClick={toggleFournitures}>
        {showFournitures ? 'Fourniture' : 'Manuelle'}
      </button>

      {showFournitures ? (
        <Fournitures_admin setFourniture_info={handleDataFromChild} />
      ) : (
        <Manuelles_admin setManuelle_info={handleDataFromChild} />
      )}
    </div>
  );
}
