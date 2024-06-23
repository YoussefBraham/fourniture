import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Fournitures_admin from './components/fournitures_admin.jsx';
import Manuelles_admin from './components/manuelles_admin.jsx';


export default function CreationListeScolaire() {
  const [ecoles, setEcoles] = useState([]);
  const [dataEcole, setDataEcole] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedEcole, setSelectedEcole] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [directingToSimilarProduct, setDirectingToSimilarProduct] = useState(false);
  const [similarItemIndex, setSimilarItemIndex] = useState([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [loadedliste, setloadedliste] = useState([]);
  const [showFournitures, setShowFournitures] = useState(false);
  const [isOption, setIsOption] = useState(false);
 

  const toggleFournitures = () => {
    setShowFournitures(true);
  };

  const toggleManuels = () => {
    setShowFournitures(false);
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
    'Questionner le Monde',
    'Manuels',
    'Education musicale'
    ];

    const annees = [
      '2022/2023',
      '2023/2024',
      '2024/2025'
      ];

  // fetching ecole list
  useEffect(() => {
    axios.get('/ecoles_2').then((response) => {
      const ecolesData = response.data;
      const nomEcole = ecolesData.map((ecole) => ecole.nom_ecole);
      setEcoles(nomEcole);
      setDataEcole(ecolesData);
    });
  }, []);

  const handleAnneeScolaireChance = (event) => {
    const selectedAnnee = event.target.value;
    setSelectedAnnee(selectedAnnee);
  };

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

  const handleAnneeChange = (event) => {
    setSelectedAnnee(event.target.value);
  };

 
  const handleSendToBackend = () => {

    // Prepare data to be sent to the backend
    const requestData = {
      ecole: selectedEcole,
      classe: selectedClasse,
      matiere: selectedMatiere,
      matiere_order: matiereOrder,
      annee_scolaire: selectedAnnee
    };
  
    // Create an array to hold the transformed items
    const transformedItems = [];
  
    // Map through the selectedItems array
    selectedItems.forEach((item, index) => {
      // Push a new object for each item to the transformedItems array
      transformedItems.push({
        annee_scolaire:  selectedAnnee,    
        ecole: selectedEcole,
        classe: selectedClasse,
        matiere: selectedMatiere,
        matiere_order: matiereOrder,
        item_id: item.item_id,
        item_quantity: item.item_quantity || 1,
        selected_color: item.selected_color || 'no color' ,
        similar_item: item.similar_item ,
        display_order:  parseInt(item.display_order) || 1,// Default to 0 if display order is not set
        final_id: selectedClasse + '-' + item.item_id + '-' + selectedMatiere + '-' + (parseInt(item.display_order) || 1),
        is_option: item.is_option ? 'true' : null,
        is_new: item.is_new ? 'true' : null,
        is_cahier_dexerxice: item.is_cahier_dexerxice ? 'true' : null,

      });
    });
  
    console.log('transformedItems',transformedItems)
    // Add the transformed items to the requestData object
    // Make an HTTP request to send the data to your backend
     axios.post('/creation_liste_2', transformedItems)
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
                updatedItems[selectedIndex].similar_item = [...(updatedItems[selectedIndex].similar_item || []), data.id];
            }
            return updatedItems;
        });
        setDirectingToSimilarProduct(false); // Reset the flag after processing

    } else {
        // If directingToSimilarProduct is false, add the data to selectedItems
        //setSelectedItems(prevItems => [...prevItems, data]);
        setSelectedItems(prevItems => [...prevItems, { ...data,item_id: data.id , item_display_order:  1 , is_option: false }]);

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
      updatedItems[index].item_quantity = quantity;
      return updatedItems;
    });
  }
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
    const itemIds = loadedliste.map(item => item.item_id);    
    axios.get('/getting_items_data', {
      params: {
        item_ids: JSON.stringify(itemIds)
      }
    })
    .then(response => {
      console.log("loadedliste",loadedliste)
      setSelectedItems(loadedliste.map(item => ({ 
        classe: item.classe,
        item_display_order: item.display_order,
        ecole: item.ecole,
        final_id: item.final_id,
        is_option: item.is_option,
        item_id: item.item_id,
        item_quantity: item.item_quantity,
        matiere: item.matiere,
        selected_color: item.selected_color,
        similar_item: item.similar_item,
  
       })));
       console.log('loadedliste[0].matiere_order',loadedliste[0].matiere_order)
       setMatiere_order(loadedliste[0].matiere_order)
      
       const updatedSelectedItems = loadedliste.map(item => {
        const matchedItem = response.data.find(responseItem => responseItem.item_id === item.item_id);
        return {
          ...item,
          image: matchedItem ? matchedItem.image : null,
          nom: matchedItem ? matchedItem.name : null,
          prix: matchedItem ? matchedItem.prix : null

        };
      });
      setSelectedItems(updatedSelectedItems);
    })
    .catch(error => {
      console.error('Axios GET error:', error);
      // Handle the error
    });
  } else {
    setSelectedItems([]);
  }
}, [loadedliste]);

console.log('selectedItems',selectedItems)

// Function to generate the "Article number X" messages based on quantity
const renderArticleNumbers = (quantity, availableColors, itemid,index) => {

  const colors = parseAvailableColors(availableColors);
  let articles = [];
  const test = Array(quantity).fill(colors[0])

  const handleColorChange = (event, articleIndex) => {
    const { value } = event.target;
    test[articleIndex-1]= value    
    const selectedIndex = selectedItems.findIndex(item => item.id === itemid);
    selectedItems[selectedIndex].selectedColor =test  
  };


  for (let i = 1; i <= quantity; i++) {
    articles.push(
      <div key={`article-${index}-${i}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ marginRight: '10px' }}>Article number {i}:</span>
        <select onChange={(event) => handleColorChange(event, i)}>
            {colors.map((color, index) => (
              <option key={index} value={color}>{color}</option>
            ))}
          </select>
      </div>
    );
  }
  return articles;
};

const parseAvailableColors = (colorsString) => {
  if (colorsString){
  if ( colorsString.includes('http')) {
    const colorEntries = colorsString.split(',');
    return colorEntries.map(entry => entry.split(':')[0].trim());
  } else {
    return colorsString.split(',').map(color => color.trim());
  }}
  else {        console.log('No available colors or color data is missing');
}
};

const handleCheckboxChange = (index, event) => {
  const { checked } = event.target;
  setSelectedItems(prevItems => {
    const updatedItems = [...prevItems];
    updatedItems[index].is_option = checked;
    return updatedItems;
  });
};

const handleIsNew = (index, event) => {
  const { checked } = event.target;
  setSelectedItems(prevItems => {
    const updatedItems = [...prevItems]
    updatedItems[index].is_new = checked
    console.log('handleIsNew', updatedItems[index]);
    return updatedItems;
  });
};

const handleCahierdExercice = (index, event) => {
  const { checked } = event.target;
  setSelectedItems(prevItems => {
    const updatedItems = [...prevItems]
    updatedItems[index].is_cahier_dexerxice = checked
    console.log('handleIsNew', updatedItems[index]);
    return updatedItems;
  });
};

const handleItemDisplayOrderChange = (index, value) => {
  setSelectedItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems[index].display_order = value;
      return updatedItems;
  });
};

const [matiereOrder, setMatiere_order] = useState(1);

  const handleMatiereOrder = (newQuantity) => {
    setMatiere_order(newQuantity);}


  console.log('selectedItems',selectedItems)

return (
    <div className="flex flex-col items-center justify-center border rounded-2xl">
      <div className="flex">

        {/*Select annee scolaire*/}
        <div className="p-2 m-4 border rounded-xl border-gray-600">
          <select
            value={selectedAnnee}
            onChange={handleAnneeChange}
          >
            <option value="">Année Scolaire</option>
            {annees.map((annee, index) => (
              <option key={index} value={annee}>
                  {annee}
              </option>
            ))}
          </select>
        </div>

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
        <p className='mb-5'>Matiere display Order:        <input
              className='border'
              type="number"
              value={matiereOrder}
              onChange={(e) => handleMatiereOrder(e.target.value)}
            /></p> 
        


        <p>Selected fournitures: </p>
        {selectedItems ? (
    <ul>
           <table className="border-collapse border">
  <thead>
    <tr className="border-b">
      <th className="border-r p-2 text-left">Picture</th>
      <th className="border-r p-2 text-left">Name</th>
      <th className="border-r p-2 text-left">Quantity</th>
      <th className="border-r p-2 text-left">Color</th>
      <th className="border-r p-2 text-left">prix</th>
      <th className="p-2 text-left border">Actions</th>
      <th className="p-2 text-left">Similar products</th>
      <th className="p-2 text-left">display_order</th>
      <th className="p-2 text-left">is_option?</th>
      <th className="p-2 text-left">Nouveau?</th>
      <th className="p-2 text-left">cachier d'exercice?</th>



    </tr>
  </thead>
  <tbody>
    {selectedItems && selectedItems.map((item, index) => (
      
      <tr className="border-b" key={index}>
        <td className="border-r p-2">
          <img src={item.image } alt= { item.nom} style={{ maxWidth: '100px', maxHeight: '100px' }} />
      

        </td>
        <td className="border-r p-2">
          <div className="flex flex-col">
            <div className="text-left">  {item.nom }</div>
            <div className="text-left">  {item.item_id }</div>

          </div>
        </td>
        <td className="border-r p-2 text-left">

{/* Input field for quantity */}
<input className=''
        type="number"
        min="0" // Set min attribute to ensure quantity is greater than or equal to 1
        value={item.item_quantity || 1} // Set default value to 1
        onChange={(event) => handleQuantityChange(index, event)}
      />

        </td>
        <td className='border-r p-2'>{item.item_quantity > 1 && item.available_colors ?   renderArticleNumbers(item.item_quantity, item.available_colors, item.id) : (item.selected_color || 'no color')}</td>

        <td className="border-r p-2 text-left flex flex-col">
          <div>prix per unit: {item.prix}</div>
          <div>Total prix : {item.prix * (item.item_quantity || 0)}</div>
          </td>
        <td className="p-2 border-r">
          <div className="flex flex-col items-center">
            <button className="border rounded p-1 m-1" onClick={() => handleRemoveItem(index)}>Remove</button>
            <button className={`border rounded p-1 m-1 ${directingToSimilarProduct ? 'bg-blue-500' : ''}`} onClick={() => AddSimilarProduct(index)}>Add a Similar Product</button>
          </div>
        </td>
        <td className="border-r p-2 text-left">            
        {item.similar_item && item.similar_item.length > 0 ? (
  <div>
    <p className="text-left">Similar Items:</p>
    {item.similar_item}

    {/*item.similarItems.map((similarItemId, similarIndex) => (
      <div className='flex flex-col' key={similarIndex}>
        <p className="text-left mr-4">{similarItemId}</p>
      </div>
    ))*/}
  </div>
) : ''}</td>
        
        <td className="border-r p-2 text-left"> 
          <input
    type="number"
    value={item.display_order || 1} // Default value is 1 if no display_order is set
    onChange={(e) => handleItemDisplayOrderChange(index, e.target.value)} // Implement this function to handle changes
    /></td>

<td className="border-r p-2 text-left">    
<input
                type="checkbox"
                checked={item.is_option}
                onChange={(event) => handleCheckboxChange(index, event)}
                style={{ marginLeft: '10px' }}              />
  
    </td>

    <td className="border-r p-2 text-left">    
<input
                type="checkbox"
                checked={item.is_new}
                onChange={(event) => handleIsNew(index, event)}
                style={{ marginLeft: '10px' }}              />
  
    </td>

    <td className="border-r p-2 text-left">    
<input
                type="checkbox"
                checked={item.is_cahier_dexerxice}
                onChange={(event) => handleCahierdExercice(index, event)}
                style={{ marginLeft: '10px' }}  />
  
    </td>
      </tr>
    ))}
    
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

<div className='flex '>
<button className="border p-3 rounded-2xl mt-10 mr-5" onClick={toggleFournitures}>
          Fournitures
      </button>

      <button className="border p-3 rounded-2xl mt-10" onClick={toggleManuels}>
        Manuels 
     </button>
     </div>

      {showFournitures ? (
        <Fournitures_admin setFourniture_info={handleDataFromChild} />
      ) : (
        <Manuelles_admin setManuelle_info={handleDataFromChild} />
      )}
    </div>
  );
}
