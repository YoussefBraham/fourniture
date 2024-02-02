import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '/Users/youssefbraham/Desktop/Ri/client/firebase.js';
import { useNavigate } from 'react-router-dom';


export default function IndexPage() {
  const [ecoles, setEcoles] = useState(['']);
  const [dataEcole, setDataeEcole] = useState(['']);
  const [selectedEcole, setSelectedEcole] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState(['']);
  const [listefourniture, setListefourniture] = useState(['']);
  const [parsedFourniture, setParsedFourniture] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const navigate = useNavigate(); // Add this line to get the navigate function



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

  useEffect(() => {
    const cleanedData = listefourniture.map((matiere) => {
      if (matiere.fourniture_list !== undefined) {
        const stringWithoutFirstTwo = matiere.fourniture_list.slice(2);
        const stringWithoutLastTwo = stringWithoutFirstTwo.slice(0, -2);
        const test = stringWithoutLastTwo.split('","');
  
        const parsedItems = test.map((list) => ({
          parsedItem: JSON.parse(list.replace(/\\/g, '')),
        }));
  
        return {
          nom_ecole: matiere.nom_ecole,
          nom_classe: matiere.nom_classe,
          nom_matiere: matiere.nom_matiere,
          fourniture_list: parsedItems,
        };
      }
      return null; // or handle the case when fourniture_list is undefined
    }).filter(Boolean); // Filter out null values
  
    setParsedFourniture(cleanedData);
  }, [listefourniture]);
  

  useEffect(() => {
    const sum = parsedFourniture.reduce((acc, { fourniture_list }) => {
      fourniture_list.forEach((element) => {
        acc += element.parsedItem.price * element.parsedItem.quantity;
      });
      return acc; // Make sure to return 'acc' after processing the fourniture_list.
    }, 0);
  
    const roundedSum = parseFloat(sum.toFixed(3));
    setTotalSum(roundedSum);
  
  
  
  
  }, [parsedFourniture]);


  const handleQuantityChange = (fournitureId, newQuantity) => {
    setParsedFourniture((prevParsedFourniture) => {
      const updatedParsedFourniture = prevParsedFourniture.map(({ nom_matiere, fourniture_list }) => ({
        nom_matiere,
        fourniture_list: fourniture_list.map(({ parsedItem }) => ({
          parsedItem: {
            ...parsedItem,
            quantity: parsedItem.id === fournitureId ? newQuantity : parsedItem.quantity,
          },
        })),
      }));

      return updatedParsedFourniture;
    });
  };


  const handleOrderCommand = () => {
    // Check if the user is logged in
    if (auth.currentUser) {
      const user_id = auth.currentUser.uid; // Assuming uid is the user_id
  
      // If logged in, proceed with the order command
      const orderData = {
        user_id: user_id,
        selectedEcole: selectedEcole,
        selectedClasse: selectedClasse,
        order_id: generateOrderId(),
        furnitureList: parsedFourniture.reduce((acc, { nom_matiere, fourniture_list }) => {
          acc.push({
            nom_matiere,
            items: fourniture_list.map(({ parsedItem }) => ({
              furniture_id: parsedItem.id,
              quantity: parsedItem.quantity,
            })),
          });
          return acc;
        }, []),
          total_price: totalSum, // Include the total price
      };
      console.log('orderData', orderData);

  
      axios.post('/ajouter_panier', orderData).then((response) => {
        // Handle the response as needed
        console.log(orderData);
      });
  
      // Redirect to the "panier" page
      navigate('/panier');
    } else {
      // If not logged in, redirect to the login page
      navigate('/login');
    }
  };
  

  const generateOrderId = () => {
    // You need to implement a function to generate a unique order ID
    // For example, you can use a timestamp or a combination of timestamp and random number
    return Date.now().toString();
  };
  
  return (
    <div className="flex flex-col items-center justify-center">

          <div>
            <div className="p-2 m-4 border rounded-xl border-gray-600">
              <select id="dropdownEcole" value={selectedEcole ?? ''} onChange={handleEcoleChange}>
                <option value="" className='text-center'>Mon école</option>
                {ecoles.map((ecole, index) => (
                  <option key={index} value={ecole}>
                    {ecole}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-2 m-4 border rounded-xl border-gray-600">
              <select id="dropdownClasse" value={selectedClasse ?? ''} onChange={handleClasseChange}>
                <option value="">Ma classe</option>
                {classes.map((classe, index) => (
                  <option key={index} value={classe}>
                    {classe}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedEcole && selectedClasse && (
            <div>
              <div className="border flex-col rounded-xl p-10 justify-between items-center">
                <div>Prix: {totalSum}</div>
                <button className="border flex-col rounded-xl" onClick={handleOrderCommand}>
              Commander la liste
            </button>
                          </div>

              <div className="border mt-10 ">
                <div>Ma Liste</div>
                <div className="border rounded-xl">
                  {parsedFourniture.map(({ nom_matiere, fourniture_list }, index) => (
                    <div key={index}>
                      <div className="border p-2">
                        <div className="flex flex-col">
                          <div className="text-left mb-2">{nom_matiere}</div>
                          {fourniture_list.map(({ parsedItem }, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <img src={parsedItem.photo} className="w-10 h-10" />
                              <div className="text-left w-1/4">{parsedItem.name}</div>
                              <div>
                            Qtt:
                            <input
                              type="number"
                              value={parsedItem.quantity}
                              onChange={(e) =>
                                handleQuantityChange(parsedItem.id, parseInt(e.target.value, 10))
                              }
                            />
                          </div>                              <div>{(parsedItem.price * parsedItem.quantity).toFixed(2)}Dnt</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        <div className="flex flex-row rounded-xl justify-evenly items-center w-screen mt-8">
          <div className="border p-4 m-4 w-1/3">Les prix les moins chers</div>
          <div className="border p-4 m-4 w-1/3">Livraison à domicile</div>
          <div className="border p-4 m-4 w-1/3">Paiement en ligne ou à la livraison</div>
        </div>


    </div>
  );
}