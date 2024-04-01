import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { auth } from '/Users/youssefbraham/Desktop/Ri/client/firebase.js';
import { useNavigate } from 'react-router-dom';


export default function IndexPage() {
  const [ecoles, setEcoles] = useState(['École Robert-Desnos']);
  const [dataEcole, setDataeEcole] = useState(['']);
  const [selectedEcole, setSelectedEcole] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState(['']);
  const [listefourniture, setListefourniture] = useState(['']);
  const [lien_liste, setLien_liste] = useState(['']);
  const [parsedFourniture, setParsedFourniture] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const navigate = useNavigate(); // Add this line to get the navigate function
  const [collapseStates, setCollapseStates] = useState({});


  useEffect(() => {

  axios.get('/ecoles').then((response) => {
    const ecolesData = response.data;
    const nom_ecole = ecolesData.map((ecole) => ecole.nom_ecole);
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
    
    axios.get('/lien_liste', {
      params: {
        classe: event.target.value,
        ecole: selectedEcole,
      },
    }).then((response) => {
      setLien_liste(response.data);
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
        const quantity = element.parsedItem.quantity || 1; // Assuming quantity defaults to 1 if undefined
        const price_f = element.parsedItem.id.charAt(0) === 'M' ? element.parsedItem.prix : element.parsedItem.price;
        acc += price_f * quantity;
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


  const handleSimilarItemleft = (item, nom_matiere) => {
    console.log('item',item)
    const currentIndex = parsedFourniture.findIndex((parsedItem) => parsedItem.nom_matiere === nom_matiere);
    const furnitureList = parsedFourniture[currentIndex].fourniture_list;
    const currentFurnitureIndex = furnitureList.findIndex((furniture) => furniture.parsedItem.id === item.id);
    const currentIndex2 = furnitureList[currentFurnitureIndex]
    const previousIndex = (currentIndex + 1 + item.similarItems.length) % item.similarItems.length;
    console.log("currentIndex2.parsedItem.similarItems",currentIndex2.parsedItem.similarItems[previousIndex])
    console.log("currentIndex2.parsedItem.similarItems.filter((_, index) => index !== currentFurnitureIndex)",currentIndex2.parsedItem.similarItems.filter((_, index) => index !== currentFurnitureIndex))


    const previousItem = {
        ...currentIndex2.parsedItem.similarItems[previousIndex],
        similarItems: [
            item,
            ...currentIndex2.parsedItem.similarItems.filter((_, index) => index !== previousIndex)
        ]
    };
    console.log('previousItem',previousItem)

    // Update the displayed item or perform any other action
    if (previousItem) {
        // Update fournitureList with the previousItem
        const updatedList = furnitureList.map((furniture, index) => {
            if (index === currentFurnitureIndex) {
                return { parsedItem: previousItem };
            }
            return furniture;
        });

        setParsedFourniture((prevParsedFourniture) => {
            return prevParsedFourniture.map((parsedItem, index) => {
                if (index === currentIndex) {
                    return { ...parsedItem, fourniture_list: updatedList };
                }
                return parsedItem;
            });
        });
    }
};



const handleSimilarItemright = (item, nom_matiere) => {
  console.log('item',item)
  const currentIndex = parsedFourniture.findIndex((parsedItem) => parsedItem.nom_matiere === nom_matiere);
  const furnitureList = parsedFourniture[currentIndex].fourniture_list;
  const currentFurnitureIndex = furnitureList.findIndex((furniture) => furniture.parsedItem.id === item.id);
  const currentIndex2 = furnitureList[currentFurnitureIndex]
  const previousIndex = (currentIndex - 1 + item.similarItems.length) % item.similarItems.length;
  console.log("currentIndex2.parsedItem.similarItems",currentIndex2.parsedItem.similarItems[previousIndex])
  console.log("currentIndex2.parsedItem.similarItems.filter((_, index) => index !== currentFurnitureIndex)",currentIndex2.parsedItem.similarItems.filter((_, index) => index !== currentFurnitureIndex))


  const previousItem = {
      ...currentIndex2.parsedItem.similarItems[previousIndex],
      similarItems: [
          item,
          ...currentIndex2.parsedItem.similarItems.filter((_, index) => index !== previousIndex)
      ]
  };
  console.log('previousItem',previousItem)

  // Update the displayed item or perform any other action
  if (previousItem) {
      // Update fournitureList with the previousItem
      const updatedList = furnitureList.map((furniture, index) => {
          if (index === currentFurnitureIndex) {
              return { parsedItem: previousItem };
          }
          return furniture;
      });

      setParsedFourniture((prevParsedFourniture) => {
          return prevParsedFourniture.map((parsedItem, index) => {
              if (index === currentIndex) {
                  return { ...parsedItem, fourniture_list: updatedList };
              }
              return parsedItem;
          });
      });
  }
};

const toggleCollapse = (index) => {
  setCollapseStates((prev) => ({
    ...prev,
    [index]: !prev[index],
  }));
  console.log(collapseStates[index])

};



const fetchProducts = async (category, subcategory) => {
  console.log('category',category)
  console.log('subcategory',subcategory)
  {/*try {
    // Make an axios GET request to your backend API
    const response = await axios.get('/get_all_products_category', {
      params: {
        category,
        subcategory,
      },
    });

    // Handle the response data (e.g., set state with the fetched products)
    console.log('Fetched products:', response.data);
    // Update state or perform any other action with the fetched products
  } catch (error) {
    console.error('Error fetching products:', error);
    // Handle errors if any
  }*/}
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

         
        <div className='bg-pink-50 border rounded-2xl p-4 mb-5'>
        <div className='p-2 mb-1'>Nous choisissons les produits de qualités les moins chers</div>
        <div className=' mb-4'>Paiement en 3x ou 4x</div>

      
      {lien_liste && lien_liste[0].lien_fourniture  &&
        <Link className='border bg-white rounded-2xl p-3' to={lien_liste[0].lien_fourniture} target="_blank" >
        Visualisez la liste
          </Link>}
        
        </div>

        <div className={`flex flex-col bg-blue-50  border rounded-2xl  ${isMobile ? 'w-screen' : 'w-1/2'}` }>
                <>
                  {parsedFourniture.map(({ nom_matiere, fourniture_list }, index) => (
                    <div key={index} className='w-full'>
                      <div className="border rounded-2xl p-2 m-3 bg-white">
                        <div className="flex flex-col w-full justify-center items-center">
                        <div className='flex w-full '>
  <div className="mb-2 items-center font-bold text-xl text-center w-full">{nom_matiere}</div>
  <div className="ml-auto">
    <button className='' onClick={() => toggleCollapse(index)}>
    <svg  transform="rotate(180)" width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.2929 15.2893C18.6834 14.8988 18.6834 14.2656 18.2929 13.8751L13.4007 8.98766C12.6195 8.20726 11.3537 8.20757 10.5729 8.98835L5.68257 13.8787C5.29205 14.2692 5.29205 14.9024 5.68257 15.2929C6.0731 15.6835 6.70626 15.6835 7.09679 15.2929L11.2824 11.1073C11.673 10.7168 12.3061 10.7168 12.6966 11.1073L16.8787 15.2893C17.2692 15.6798 17.9024 15.6798 18.2929 15.2893Z" fill="#0F0F0F"/>
</svg>
    </button>
  </div>
</div>

                          <div className={`grid grid-cols-3 gap-4 text-center`}>
                          {!collapseStates[index] && (    
                            <>                    
                          {fourniture_list.map(({ parsedItem }, i) => (                                                        
                            <div key={i} className="border rounded-lg p-4 h-full">
                              {/* bouton supprimer*/}
                              <div className=' w-full flex justify-end'>
                              <button className="" >
                              <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2.75C11.0215 2.75 10.1871 3.37503 9.87787 4.24993C9.73983 4.64047 9.31134 4.84517 8.9208 4.70713C8.53026 4.56909 8.32557 4.1406 8.46361 3.75007C8.97804 2.29459 10.3661 1.25 12 1.25C13.634 1.25 15.022 2.29459 15.5365 3.75007C15.6745 4.1406 15.4698 4.56909 15.0793 4.70713C14.6887 4.84517 14.2602 4.64047 14.1222 4.24993C13.813 3.37503 12.9785 2.75 12 2.75Z" fill="#1C274C"/>
<path d="M2.75 6C2.75 5.58579 3.08579 5.25 3.5 5.25H20.5001C20.9143 5.25 21.2501 5.58579 21.2501 6C21.2501 6.41421 20.9143 6.75 20.5001 6.75H3.5C3.08579 6.75 2.75 6.41421 2.75 6Z" fill="#1C274C"/>
<path d="M5.91508 8.45011C5.88753 8.03681 5.53015 7.72411 5.11686 7.75166C4.70356 7.77921 4.39085 8.13659 4.41841 8.54989L4.88186 15.5016C4.96735 16.7844 5.03641 17.8205 5.19838 18.6336C5.36678 19.4789 5.6532 20.185 6.2448 20.7384C6.83639 21.2919 7.55994 21.5307 8.41459 21.6425C9.23663 21.75 10.2751 21.75 11.5607 21.75H12.4395C13.7251 21.75 14.7635 21.75 15.5856 21.6425C16.4402 21.5307 17.1638 21.2919 17.7554 20.7384C18.347 20.185 18.6334 19.4789 18.8018 18.6336C18.9637 17.8205 19.0328 16.7844 19.1183 15.5016L19.5818 8.54989C19.6093 8.13659 19.2966 7.77921 18.8833 7.75166C18.47 7.72411 18.1126 8.03681 18.0851 8.45011L17.6251 15.3492C17.5353 16.6971 17.4712 17.6349 17.3307 18.3405C17.1943 19.025 17.004 19.3873 16.7306 19.6431C16.4572 19.8988 16.083 20.0647 15.391 20.1552C14.6776 20.2485 13.7376 20.25 12.3868 20.25H11.6134C10.2626 20.25 9.32255 20.2485 8.60915 20.1552C7.91715 20.0647 7.54299 19.8988 7.26957 19.6431C6.99616 19.3873 6.80583 19.025 6.66948 18.3405C6.52891 17.6349 6.46488 16.6971 6.37503 15.3492L5.91508 8.45011Z" fill="#1C274C"/>
<path d="M9.42546 10.2537C9.83762 10.2125 10.2051 10.5132 10.2464 10.9254L10.7464 15.9254C10.7876 16.3375 10.4869 16.7051 10.0747 16.7463C9.66256 16.7875 9.29502 16.4868 9.25381 16.0746L8.75381 11.0746C8.71259 10.6625 9.0133 10.2949 9.42546 10.2537Z" fill="#1C274C"/>
<path d="M15.2464 11.0746C15.2876 10.6625 14.9869 10.2949 14.5747 10.2537C14.1626 10.2125 13.795 10.5132 13.7538 10.9254L13.2538 15.9254C13.2126 16.3375 13.5133 16.7051 13.9255 16.7463C14.3376 16.7875 14.7051 16.4868 14.7464 16.0746L15.2464 11.0746Z" fill="#1C274C"/>
                                </svg>
                                </button> 
                                </div>                              
                              <div className='flex items-center flex-col rounded-2xl h-full p-3'>
                              
                              {/* image */}
                              <div className=''>
                                <img className={`${parsedItem.id.charAt(0) === 'M' ? ' w-30 h-36 mb-3 p-2' : 'w-32 h-32 mb-3 p-2'}`} src={parsedItem.id.charAt(0) === 'M' ? parsedItem.image : parsedItem.product_picture  } alt= {parsedItem.id.charAt(0) === 'M' ? parsedItem.nom : parsedItem.name_to_display}  /></div>
                              
                              {/* nom category etc*/}
                              <div className='flex flex-col h-4/5 justify-evenly w-full'>

                              <h2 className={`text-center text-xl mb-2 line-clamp-2 ${parsedItem.id.charAt(0) === 'M' ? '2/3' : '1/3'} `}>                                

                                {parsedItem.id.charAt(0) === 'M' ? parsedItem.nom : parsedItem.category  }
                                </h2>

                                <h2 className={`text-center text-xs line-clamp-3  ${parsedItem.id.charAt(0) === 'M' ? '' : ''}`}>
                                {parsedItem.id.charAt(0) === 'M' ? (<>ISBN: {parsedItem.isbn_numeric}</>) : parsedItem.name  }
                                </h2>
                                
                                {parsedItem.id.charAt(0) === 'M' ? (
  <></>
) : (
  <div className='flex mb-2 mt-2'>
    {parsedItem.similarItems && parsedItem.similarItems.length >0 ? (
      <>
        <button className='text-pink-500 p-1 border border-gray-300 rounded-2xl w-1/4 text-xs' onClick={() => handleSimilarItemleft(parsedItem, nom_matiere)}>
          <svg width="" height="1/2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M5 12L11 6M5 12L11 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>                                                             
        <button className='ml-2 text-green-400 p-1 border rounded-2xl w-1/4 text-xs' onClick={() => handleSimilarItemright(parsedItem, nom_matiere)}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(180)">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M5 12H19M5 12L11 6M5 12L11 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </g>
          </svg>
        </button>
      </>
    ) : (
      <div></div>
    )}
    <button className='ml-2 text-blue-300 p-1 border rounded-2xl text-xs w-full' onClick={() => fetchProducts(parsedItem.category, parsedItem.subcategory)}>
      Voir tout les produits
    </button> 
  </div>
)}

                                
                                </div>

                              {/* prix qtt supprimer*/}
                              <>
                                { parsedItem.quantity ? (

                                <div className=' flex justify-center items-center border rounded-2xl p-2'>       

                                  <div className='text-xs flex items-center  justify-center w-1/2'> Qtt: 
                                        <input
                                          type="number"
                                          className='ml-2 w-3/5'
                                          value={parsedItem.quantity ? (parsedItem.quantity) :(1) }
                                          onChange={(e) =>
                                            handleQuantityChange(parsedItem.id, Math.max(parseInt(e.target.value, 10), 0))
                                          }
                                        />                                
                                </div>  

                                <div className=' flex'>
                                <div className=' text-xl font-bold  mr-1'>{parsedItem.id.charAt(0) === 'M' ? (parsedItem.prix * parsedItem.quantity).toFixed(2) : (parsedItem.price *parsedItem.quantity).toFixed(2)} </div>
                                <div className='mt-1 text-m font-bold'> Dnt</div>
                              </div>

  
                              </div>)
                              :
                              (
                              <div className=' flex justify-center items-center border rounded-2xl p-2'>                                  
                                  
                                  <div className='text-xs flex items-center  justify-center w-1/2 mr-5'>Qtt:
                                        <input
                                          type="number"
                                          className='ml-2 w-3/5'
                                          value={parsedItem.quantity ? (parsedItem.quantity) :(1) }
                                          onChange={(e) =>
                                            handleQuantityChange(parsedItem.id, Math.max(parseInt(e.target.value, 10), 0))
                                          }
                                        />
                                    </div> 

                              <div className=' flex'>
                              <div className=' text-xl font-bold  mr-1'>{parsedItem.id.charAt(0) === 'M' ? parsedItem.prix  : parsedItem.price} </div>
                                <div className='mt-1 text-m font-bold'> Dnt</div>
                              </div>


                                </div>)
                              }
                              </>
                                 
                                
                                </div>
                                
                                  </div>

                                  
                          
                          
                          ))}
                          <div class="w-full flex border border-blue-100 rounded-lg p-4 h-full items-center justify-center"><button class="border p-2 rounded-2xl">Ajouter un autre Article</button></div>
                          </>                        )}

                         

                          </div>
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