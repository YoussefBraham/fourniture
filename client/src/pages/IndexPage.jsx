import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { auth } from '/Users/youssefbraham/Desktop/Ri/client/firebase.js';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'


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
}, []);


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
    axios.get('/all_fourniture_classe', {
      params: {
        classe: event.target.value,
        ecole: selectedEcole,
      },
    }).then((response) => {
      setListefourniture(response.data);
    }); 


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


  const handleOrderCommand = async () => {
    // Check if the user is logged in
    if (auth.currentUser) {
      const user_id = auth.currentUser.uid; // Assuming uid is the user_id
  
      // If logged in, proceed with the order command
      const orderData = {
        user_id: user_id,
        selected_ecole: selectedEcole,
        selected_classe: selectedClasse,
        panier_id: generatePanierId(),
        furniture_list: parsedFourniture.reduce((acc, { nom_matiere, fourniture_list }) => {
          acc.push({
            nom_matiere,
            items: fourniture_list.map(({ parsedItem }) => ({
              furniture_id: parsedItem.id,
              name: parsedItem.name,
              quantity: parsedItem.quantity,
            })),
          });
          return acc;
        }, []),
        total_price: totalSum, // Include the total price
      };
  
      try {
        // Wait for the order creation to complete
        await axios.post('/ajouter_panier', orderData);
        localStorage.setItem('panier_local', JSON.stringify(orderData));
  
        // Clear any existing pending order data from local storage
        localStorage.removeItem('panier_local');
  
        // Redirect to the "panier" page
        navigate('/panier');
      } catch (error) {
        console.error('Error creating order:', error);
        localStorage.removeItem('pending_panier');

        // Handle the error as needed
      }
    } else {

      const orderData = {
        user_id: null,
        selected_ecole: selectedEcole,
        selected_classe: selectedClasse,
        panier_id: generatePanierId(),
        furniture_list: parsedFourniture.reduce((acc, { nom_matiere, fourniture_list }) => {
          acc.push({
            nom_matiere,
            items: fourniture_list.map(({ parsedItem }) => ({
              furniture_id: parsedItem.id,
              name: parsedItem.name,
              quantity: parsedItem.quantity,
            })),
          });
          return acc;
        }, []),
        total_price: totalSum, // Include the total price
      };

      // If not logged in, store the order data in local storage as a pending order
      const pendingOrderData = JSON.parse(localStorage.getItem('pending_panier')) || [];
      // Append the new data to existing pending orders
      const updatedPendingOrders = [...pendingOrderData, orderData];
      // Store the updated pending orders back to localStorage
      localStorage.setItem('pending_panier', JSON.stringify(updatedPendingOrders));
  
      // Redirect to the login page
      navigate('/login');
    }
  };
  
  

  const generatePanierId = () => {
    // You need to implement a function to generate a unique order ID
    // For example, you can use a timestamp or a combination of timestamp and random number
    const timestamp = Date.now();
  
    // Generate a random string (you can use a more sophisticated logic if needed)
    const randomString = Math.random().toString(36).substring(7);
  
    // Combine timestamp and random string to create the order ID
    const uId = `${timestamp}-${randomString}`;
    return uId;
  };
  
  const isMobile = window.innerWidth <= 500; // Adjust the threshold as needed
  
  const containerStyle = {
    backgroundColor: '#ffffff',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='52' viewBox='0 0 52 52'%3E%3Cpath fill='%23bc504c' fill-opacity='0.3' d='M0 17.83V0h17.83a3 3 0 0 1-5.66 2H5.9A5 5 0 0 1 2 5.9v6.27a3 3 0 0 1-2 5.66zm0 18.34a3 3 0 0 1 2 5.66v6.27A5 5 0 0 1 5.9 52h6.27a3 3 0 0 1 5.66 0H0V36.17zM36.17 52a3 3 0 0 1 5.66 0h6.27a5 5 0 0 1 3.9-3.9v-6.27a3 3 0 0 1 0-5.66V52H36.17zM0 31.93v-9.78a5 5 0 0 1 3.8.72l4.43-4.43a3 3 0 1 1 1.42 1.41L5.2 24.28a5 5 0 0 1 0 5.52l4.44 4.43a3 3 0 1 1-1.42 1.42L3.8 31.2a5 5 0 0 1-3.8.72zm52-14.1a3 3 0 0 1 0-5.66V5.9A5 5 0 0 1 48.1 2h-6.27a3 3 0 0 1-5.66-2H52v17.83zm0 14.1a4.97 4.97 0 0 1-1.72-.72l-4.43 4.44a3 3 0 1 1-1.41-1.42l4.43-4.43a5 5 0 0 1 0-5.52l-4.43-4.43a3 3 0 1 1 1.41-1.41l4.43 4.43c.53-.35 1.12-.6 1.72-.72v9.78zM22.15 0h9.78a5 5 0 0 1-.72 3.8l4.44 4.43a3 3 0 1 1-1.42 1.42L29.8 5.2a5 5 0 0 1-5.52 0l-4.43 4.44a3 3 0 1 1-1.41-1.42l4.43-4.43a5 5 0 0 1-.72-3.8zm0 52c.13-.6.37-1.19.72-1.72l-4.43-4.43a3 3 0 1 1 1.41-1.41l4.43 4.43a5 5 0 0 1 5.52 0l4.43-4.43a3 3 0 1 1 1.42 1.41l-4.44 4.43c.36.53.6 1.12.72 1.72h-9.78zm9.75-24a5 5 0 0 1-3.9 3.9v6.27a3 3 0 1 1-2 0V31.9a5 5 0 0 1-3.9-3.9h-6.27a3 3 0 1 1 0-2h6.27a5 5 0 0 1 3.9-3.9v-6.27a3 3 0 1 1 2 0v6.27a5 5 0 0 1 3.9 3.9h6.27a3 3 0 1 1 0 2H31.9z'%3E%3C/path%3E%3C/svg%3E")`
  };

  return (
    <div className="flex flex-col items-center justify-center w-auto">

        {/* input class ecole*/}

          {isMobile ? (<div>
            <div className='w-full lg:w-screen flex flex-col justify-around items-center content-between mb-5'>

              <div className='bg-white p-3'>
            <img className='flex-shrink-0 bg-white' src={'/to_do_list_2.png'} alt="User Profile" style={{ borderRadius: '50%', width: '100px', height: '100px' }} />
            </div>

                    <div id=' dropdown_class_ecole' className="flex flex-col ">

                    <div className="p-2 m-2 border rounded-xl border-gray-300 bg-white">
                        <select id="dropdownEcole" className='w-full bg-white text-center' value={selectedEcole ?? ''} onChange={handleEcoleChange}>
                          <option value="" className='flex items-center justify-center text-center bg-white '>Ecole</option>
                          {ecoles.map((ecole, index) => (
                            <option key={index} value={ecole} className='text-center'>
                              {ecole}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="p-2 m-2 border rounded-xl border-gray-300 bg-white">
                        <select id="dropdownClasse" className='w-full bg-white text-center' value={selectedClasse ?? ''} onChange={handleClasseChange}>
                          <option value="" className='text-center bg-white '>Classe</option>
                          {classes.map((classe, index) => (
                            <option key={index} value={classe}>
                              {classe}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

          </div>
                      </div>

          ) : (
          <div className='w-full lg:w-screen flex flex-row justify-around items-center content-between mb-2'>
                  <img className='flex-shrink-0 p-2 bg-white' src={'/To_Do_List.png'} alt="User Profile" style={{ borderRadius: '50%', width: '200px', height: '200px' }} />

                    <div id=' dropdown_class_ecole' className="flex flex-col ">

                      <div className="p-2 m-2 border rounded-xl border-gray-600 bg-white w-auto">
                        <select id="dropdownEcole" className='w-full bg-white text-center' value={selectedEcole ?? ''} onChange={handleEcoleChange}>
                          <option value="" className='text-center bg-white w-max '>Ecole</option>
                          {ecoles.map((ecole, index) => (
                            <option key={index} value={ecole}>
                              {ecole}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="p-2 m-2 border rounded-xl border-gray-600 bg-white w-auto">
                        <select id="dropdownClasse" className='w-full bg-white text-center' value={selectedClasse ?? ''} onChange={handleClasseChange}>
                          <option value="" className='text-center bg-white w-max'>Classe</option>
                          {classes.map((classe, index) => (
                            <option key={index} value={classe}>
                              {classe}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <img className='flex-shrink-0 p-2 bg-white' src={'/to_do_list_2.png'} alt="User Profile" style={{ borderRadius: '50%', width: '200px', height: '200px' }} />
          </div>)}
        
        {/* display list*/}

          {selectedEcole && selectedClasse && (
            <div className='flex flex-col items-center w-screen'>
                    
            <div className=" flex-col rounded-xl p-4 mb-5 justify-between items-center bg-white w-auto border">
          <div className="text-2xl font-bold mb-4">{totalSum} Dnt</div>
          <button className="bg-green-300 py-2 px-4 rounded-full" onClick={handleOrderCommand}>
            Commander ma liste
          </button>
        </div>

        <div className={`flex flex-col  items-center justify-center border rounded-2xl  ${isMobile ? 'w-screen' : 'w-1/2'}` }>
                <>
                  {parsedFourniture.map(({ nom_matiere, fourniture_list }, index) => (
                    <div key={index} className='w-full'>
                      <div className="border rounded-2xl p-2 m-3 bg-white">
                        <div className="flex flex-col w-full">
                          <div className="mb-2 text-center font-bold">{nom_matiere}</div>
                          {fourniture_list.map(({ parsedItem }, i) => (
                            <div key={i} className="flex justify-between items-center ">
                              <img src={parsedItem.photo} className="w-10 h-10 mb-3" />
                              <div className='w-3/4 ml-5'>
                              <div className="text-left ">{parsedItem.type}</div>
                              </div>
                              <div className='flex text-right '>
                                        <button
                                          onClick={() => handleQuantityChange(parsedItem.id, Math.max(parsedItem.quantity - 1, 0))}
                                          className="bg-gray-200 px-2 py-1 rounded-l cursor-pointer"
                                        >
                                          <FontAwesomeIcon icon={faMinus} />
                                        </button>
                                        <input
                                          type="number"
                                          className='border text-center w-1/4'
                                          value={parsedItem.quantity}
                                          onChange={(e) =>
                                            handleQuantityChange(parsedItem.id, Math.max(parseInt(e.target.value, 10), 0))
                                          }
                                        />
                                        <button
                                          onClick={() => handleQuantityChange(parsedItem.id, parsedItem.quantity + 1)}
                                          className="bg-gray-200 px-2 py-1 rounded-r cursor-pointer"
                                        >
                                          <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                      </div>                                       
                              <div className='w-1/4'>{(parsedItem.price * parsedItem.quantity).toFixed(2)} Dnt</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              </div> 
            </div>
          )}


        {/* svgs*/}
        <div className="flex flex-row rounded-xl justify-evenly items-center w-screen mt-8">

        <div className="border rounded-3xl p-4 m-2  flex flex-col items-center bg-white w-auto " style={{ height: 'auto' }}>
            <img
      src={'/low-sales.png'}
      alt=""
      className="w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32 m-3"
    />
            Les prix les moins chers</div>

            <div className="border rounded-3xl p-4 m-4  flex flex-col items-center bg-white w-auto" style={{ height: 'auto' }}>
            <img
      src={'/delivery-man.png'}
      alt=""
      className="w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32 m-3 "
    />
            Livraison à domicile</div>

        </div>


    </div>
  );
}