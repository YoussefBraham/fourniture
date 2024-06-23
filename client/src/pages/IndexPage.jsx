import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { auth } from '../../firebase.js';
import { useNavigate } from 'react-router-dom';
import RenderColorQuantities  from '../pages/components/rendercolorquantites.jsx'
import {Multiselect} from "multiselect-react-dropdown"



export default function IndexPage({ parsedItems }) {
  const [ecoles, setEcoles] = useState(['']);
  const [dataEcole, setDataEcole] = useState(['']);
  const [selectedEcole, setSelectedEcole] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState(['']);
  const [listefourniture, setListefourniture] = useState(['']);
  const [lien_liste, setLien_liste] = useState(['']);
  const [parsedFourniture, setParsedFourniture] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const navigate = useNavigate(); // Add this line to get the navigate function
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [showProductList, setShowProductList] = useState(false); 
  const [selectedcategory, setSelectedcategory] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAjouterunArticle, setShowAjouterunArticle] = useState(false);
  const[selectedColor,setSelectedColor] = useState([''])
  const [showColorsSelected, setShowColorsSelected] = useState(false); 
  const [options_to_select, setOptionsToSelect] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);



const uniqueMatieres = [...new Set(listefourniture.map(item => item.matiere))];
// Initialize collapseStates with 0 set to false and others to true
const [collapseStates, setCollapseStates] = useState({});

useEffect(() => {
  const generateInitialCollapseStates = () => {
    const initialState = {};
    uniqueMatieres.forEach((_, index) => {
      initialState[index] = index === 0 ? false : true;
    });
    return initialState;
  };

  setCollapseStates(generateInitialCollapseStates());
}, []);

  //getting ecole
  useEffect(() => {
    axios.get('/ecoles').then((response) => {
      const uniqueEcoles = [...new Set(response.data.map(item => item.ecole))];
      setEcoles(uniqueEcoles);
      setDataEcole(response.data);

      const savedEcole = sessionStorage.getItem('selectedEcole');
      if (savedEcole) {
        setSelectedEcole(savedEcole);
        const filteredDataEcole = response.data.filter((ecole_item) =>
          ecole_item.ecole === savedEcole
        );
        let nom_classe = filteredDataEcole.map((ecole_item) => ecole_item.classe);
        console.log("nom_classe",nom_classe)
        const predefinedOrder = ['ps', 'ms', 'gs', 'CP', 'CM1', 'CM2', 'Sixième']
        nom_classe = nom_classe.sort((a, b) => {
          const indexA = predefinedOrder.indexOf(a);
          const indexB = predefinedOrder.indexOf(b);
  
          // If an item is not found in the predefinedOrder, put it at the end
          const orderA = indexA !== -1 ? indexA : predefinedOrder.length;
          const orderB = indexB !== -1 ? indexB : predefinedOrder.length;
  
          return orderA - orderB;
        });
  

        setClasses(nom_classe);
         const savedClasse = sessionStorage.getItem('selectedClasse');
       
         if (savedClasse) {
          setSelectedClasse(savedClasse);
          fetchData(savedClasse, savedEcole);
          //getting Lien liste scolaire            
        }
        const savedSelectedOptions = sessionStorage.getItem('selectedOptions');
        if (savedSelectedOptions) {
          setSelectedOptions(JSON.parse(savedSelectedOptions));
        }

      }
    });
  }, []);

  // Getting classes when change ecole
const handleEcoleChange = (event) => {
  const selectedEcoleValue = event.target.value;
  setSelectedEcole(selectedEcoleValue);
  sessionStorage.setItem('selectedEcole', selectedEcoleValue);
  const filteredDataEcole = dataEcole.filter((ecole_item) =>
    ecole_item.ecole === selectedEcoleValue
  );
  const nom_classe = filteredDataEcole.map((ecole_item) => ecole_item.classe);
  setClasses(nom_classe);
};

// Getting fournitures and link when classe change
  const handleClasseChange = (event) => {
    setSelectedClasse(event.target.value);
    sessionStorage.setItem('selectedClasse', event.target.value);

        //getting Lien liste scolaire
        axios.get('/lien_liste', {
          params: {
            classe: event.target.value,
            ecole: selectedEcole,
          },
        }).then((response) => {
          setLien_liste(response.data);

        });
      
      //Gettin fournitures_liste
    axios.get('/all_fourniture_classe_2', {
      params: {
        classe: event.target.value,
        ecole: selectedEcole,
      },
    }).then((response) => {
      setListefourniture(response.data);

    }); 

  };

  const fetchData = (classe, ecole) => {
    // Fetch Lien liste scolaire

    axios.get('/lien_liste', {
      params: {
        classe: classe,
        ecole: ecole,
      },
    }).then((response) => {
      setLien_liste(response.data);
    });
    
    // Fetch fournitures_liste
    axios.get('/all_fourniture_classe_2', {
      params: {
        classe: classe,
        ecole: ecole,
      },
    }).then((response) => {
      setListefourniture(response.data);
    }); 
  };

  useEffect(() => {
    const sum = listefourniture.filter(item => item.is_option === null || item.to_display === true).reduce((acc, element) => {
      const quantity = element.item_quantity ; // Assuming quantity defaults to 1 if undefined
      const price_f = element.prix;
      return acc + (price_f * quantity); // Return the updated accumulator value
    }, 0);
  
    const roundedSum = parseFloat(sum.toFixed(3));
    setTotalSum(roundedSum);
  }, [listefourniture]);
 
    
  const handleQuantityChange = (fournitureId, newQuantity) => {
    // Find the index of the item in listefourniture
    const currentIndex = listefourniture.findIndex((parsedItem) => parsedItem.final_id === fournitureId);  
    const updatedQuantity = Math.max(newQuantity, 1); // Ensure quantity is at least 1

    // Create a copy of the item with the updated quantity
    const updatedItem = { ...listefourniture[currentIndex], item_quantity: updatedQuantity };
    // Create a copy of listefourniture with the updated item
    const updatedListefourniture = [...listefourniture];
    updatedListefourniture[currentIndex] = updatedItem;
    // Update the state with the new listefourniture
    setListefourniture(updatedListefourniture);
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
              furniture_id: parsedItem.item_id,
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

  const handleVentreLivre = async () => {
    if (auth.currentUser) {
      const user_id = auth.currentUser.uid; // Assuming uid is the user_id
      navigate('/venteLivres');

    } else {
      navigate('/login');
    }    

  } 
  
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
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  useEffect(()=> {
    const handleResize = ()=> {
      setIsMobile(window.innerWidth <= 1000);
    };

    // Add event listener to handle window resize
    window.addEventListener('resize', handleResize);

    // Remove event listener on component unmount
    return ()=> window.removeEventListener('resize', handleResize);
  }, []);

  const handleSimilarItemleft = async (item_id_import, similar_items, nom_matiere, final_id) => {
    // finding index of product to replace
    const currentIndex = listefourniture.findIndex((parsedItem) => parsedItem.final_id === final_id);  
    // getting the similar_item to use as recplacement
    const similarItemsArray = similar_items.substring(1, similar_items.length - 1).split(',');
  

    // adding back the replace product as similar product at the end of the array
    similarItemsArray.push(item_id_import);
    // Extract the first element of the array
    const firstSimilarItem = similarItemsArray[0];
        // delete the first element of the array
    similarItemsArray.shift(); 
          // replacing the displayed product
    try {
      const response = await axios.get('/similarItems', {
        params: {
          similar_item_id: firstSimilarItem
        }
      });
      const simItem1 = response.data[0]; // Assuming the response is an array
      // Update the state with the modified listefourniture
      setListefourniture(prevListefourniture => {
        const newListefourniture = [...prevListefourniture];
        newListefourniture[currentIndex].item_id = simItem1.id;
        newListefourniture[currentIndex].available_colors = simItem1.available_colors;
        newListefourniture[currentIndex].category = simItem1.category;
        newListefourniture[currentIndex].image = simItem1.image;
        newListefourniture[currentIndex].isbn_numeric = simItem1.isbn_numeric;
        newListefourniture[currentIndex].name = simItem1.name_to_display;
        //newListefourniture[currentIndex].similar_item = simItem1.id;
        newListefourniture[currentIndex].prix = simItem1.prix;

        return newListefourniture
      }
    );
    } catch (error) {
      console.error('Error fetching similar items:', error);
    }
    const similarItemsString = `[${similarItemsArray.join()}]`;
    setListefourniture(prevListefourniture => {
      const newListefourniture = [...prevListefourniture];
      newListefourniture[currentIndex].similar_item = similarItemsString;
      return newListefourniture;
    });
   };

const handleSimilarItemright = async (item_id_import, similar_items, nom_matiere,final_id) => {

      // finding index of product to replace
    const currentIndex = listefourniture.findIndex((parsedItem) => parsedItem.final_id === final_id);  
        // getting the similar_item to use as recplacement
    const similarItemsArray = similar_items.substring(1, similar_items.length - 1).split(',');

        // delete the first element of the array      
        const lastSimilarItem = similarItemsArray.pop();
        similarItemsArray.unshift(item_id_import)

    try {
      const response = await axios.get('/similarItems', {
        params: {
          similar_item_id: lastSimilarItem
        }
      });
      const simItem1 = response.data[0]; // Assuming the response is an array
      // Update the state with the modified listefourniture
      setListefourniture(prevListefourniture => {
        const newListefourniture = [...prevListefourniture];
        newListefourniture[currentIndex].item_id = simItem1.id;
        newListefourniture[currentIndex].available_colors = simItem1.available_colors;
        newListefourniture[currentIndex].category = simItem1.category;
        newListefourniture[currentIndex].image = simItem1.image;
        newListefourniture[currentIndex].isbn_numeric = simItem1.isbn_numeric;
        newListefourniture[currentIndex].name = simItem1.name_to_display;
        newListefourniture[currentIndex].similar_item = ''
        newListefourniture[currentIndex].prix = simItem1.prix;
        return newListefourniture;
      });
    } catch (error) {
      console.error('Error fetching similar items:', error);
    }

  
    const similarItemsString = `[${similarItemsArray.join()}]`;  
    setListefourniture(prevListefourniture => {
      const newListefourniture = [...prevListefourniture];
      newListefourniture[currentIndex].similar_item = similarItemsString;
      return newListefourniture;
    });
};

const toggleCollapse = (index) => {
  setCollapseStates((prev) => ({
    ...prev,
    [index]: !prev[index],
  }));

};

/* Second collapse not sure which on is better
const toggleCollapse = (index) => {
  setCollapseStates((prev) => {
    const newState = {}; // Create a new state object

    // Iterate over all keys in the previous state
    Object.keys(prev).forEach((key) => {
      // Set the value of the current key to false except for the specified index
      newState[key] = key !== index.toString(); // Convert index to string for comparison
    });

    return newState; // Return the updated state object
  });
};*/

const fetchProducts = async (category, subcategory, item_id, matiere, final_id) => {
  try {
    // Make an axios GET request to your backend API
    const response = await axios.get('/get_all_products_category', {
      params: {
        category,
      },
    });

    // Handle the response data (e.g., set state with the fetched products)
    setFetchedProducts(response.data);
    setShowProductList(true); // Show the product list div
    setSelectedcategory(category)

    // Update state or perform any other action with the fetched products
  } catch (error) {
    console.error('Error fetching products:', error);
    // Handle errors if any
  }
setSelectedProduct(final_id)
};

const handleCloseProductList = () => {
  setShowProductList(false); // Hide the product list div
  setFetchedProducts([]); // Clear the fetched products
};

const handleCloseAjouterunArticle = () => {
  setShowAjouterunArticle(false); // Hide the product list div
};

const handleDeleteItem = (item,matiere) => {
  const updatedListefourniture = listefourniture.filter(entry => entry.final_id !== item );
  setListefourniture(updatedListefourniture)
}

const handleReplaceProduct = (product) => {
const indexToReplace = listefourniture.findIndex(item => item.final_id == selectedProduct)
listefourniture[indexToReplace] 
listefourniture[indexToReplace].item_id = product.id;
listefourniture[indexToReplace].available_colors = product.available_colors;
listefourniture[indexToReplace].category = product.category;
listefourniture[indexToReplace].image = product.image;
listefourniture[indexToReplace].isbn_numeric = product.isbn_numeric;
listefourniture[indexToReplace].name = product.name_to_display;
listefourniture[indexToReplace].prix = product.prix;

setShowProductList(false); // Hide the product list div
setFetchedProducts([]); // Clear the fetched products
};

const toggleConstructionDiv = () => {
  setShowAjouterunArticle(!showAjouterunArticle); // Toggle the visibility
  alert('Not working yet')
};

const parseAvailableColors = (colorsString) => {
  if (colorsString.includes('http')) {
    const colorEntries = colorsString.split(',');
    return colorEntries.map(entry => entry.split(':')[0].trim());
  } else {
    return colorsString.split(',').map(color => color.trim());
  }
};

const renderColorDropdowns = (colorsString,final_id, quantity =1) => {
  const dropdowns = [];
  const colors = parseAvailableColors(colorsString);
  
  

  for (let i = 0; i < quantity; i++) {
    dropdowns.push(

      <div className='flex items-center justify-around   border-red w-min rounded-2xl pl-2 '>
      <select className="bg-white rounded-md p-2 w-min text-xs "   onChange={(event) => setSelectedColor(event.target.value)}
>
        <option value="" className='flex items-center justify-center text-center text-xs bg-white w-min'>Couleur disponible</option>
        {colors.map((color, index) => (
          <option key={`${i}-${index}`}
           value={color}>
            {color}
          </option>
        ))}
      </select>
      <button className=' rounded-3xl font-bold   ml-4 text-3xl'   onClick={() => addColorbutton(selectedColor, final_id )} >
      <svg width="20px" height="20px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
    
    <title>plus-circle</title>
    <defs>

</defs>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" sketch:type="MSPage">
        <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-464.000000, -1087.000000)" fill="#000000">
            <path d="M480,1117 C472.268,1117 466,1110.73 466,1103 C466,1095.27 472.268,1089 480,1089 C487.732,1089 494,1095.27 494,1103 C494,1110.73 487.732,1117 480,1117 L480,1117 Z M480,1087 C471.163,1087 464,1094.16 464,1103 C464,1111.84 471.163,1119 480,1119 C488.837,1119 496,1111.84 496,1103 C496,1094.16 488.837,1087 480,1087 L480,1087 Z M486,1102 L481,1102 L481,1097 C481,1096.45 480.553,1096 480,1096 C479.447,1096 479,1096.45 479,1097 L479,1102 L474,1102 C473.447,1102 473,1102.45 473,1103 C473,1103.55 473.447,1104 474,1104 L479,1104 L479,1109 C479,1109.55 479.447,1110 480,1110 C480.553,1110 481,1109.55 481,1109 L481,1104 L486,1104 C486.553,1104 487,1103.55 487,1103 C487,1102.45 486.553,1102 486,1102 L486,1102 Z" id="plus-circle" sketch:type="MSShapeGroup">

</path>
        </g>
    </g>
</svg>
      </button>
      </div>

  );
  }

  return dropdowns;
};


const countColors = (colors) => {
  const colorCounts = {};
  colors.forEach(color => {
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });
  return colorCounts;
  
};

const renderColorQuantities = (colorCounts,final_id) => {
  return Object.entries(colorCounts).map(([color, count]) => (
    <button className='flex'  onClick={() => show_colors_list(final_id)}>
    <div className='flex flex-col' key={color}>
       {count} x {color}
    </div>
    </button>
  ));
};

const handleChange = (color) => (event) => {
};

const renderColorQuantities_2 = (initialColorCounts) => {
  return (
    <>
      {Object.entries(initialColorCounts).map(([color, count]) => (
        <div className='flex flex-col m-2 text-xl' key={color}>
          <div className='flex items-center justify-center h-3/4'>
            <span className='w-1/2'>{color}: </span>
            <input
              type='number'
              value={count}
              min='0'
              onChange={handleChange(color)}
              className='rounded w-1/5'
            />
          </div>
        </div>
      ))}
    </>
  );
};

const addColorbutton = (value,final_id) => {
const currentIndex = listefourniture.findIndex((parsedItem) => parsedItem.final_id === final_id);  


const updatedList = [...listefourniture];
updatedList[currentIndex].item_quantity = parseInt(listefourniture[currentIndex].item_quantity) + 1;
updatedList[currentIndex].selected_color += `, ${value}`;
setListefourniture(updatedList);



};

const iframeRef = useRef(null);

useEffect(() => {
  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.location.reload(true);
    }
  };

  if (isMobile) {
    // Listen for the load event of the iframe
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad);
    }

    // Cleanup function to remove event listener
    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleIframeLoad);
      }
    };
  }
}, [isMobile]);


const [iframeFixed, setIframeFixed] = useState(false);
const [naturalHeight, setNaturalHeight] = useState(null); // State to store natural height


function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

useEffect(() => {
  const handleScroll = debounce(() => {
    if (iframeRef.current) {
      const parentRect = iframeRef.current.getBoundingClientRect();
      const iframeTop = iframeRef.current.getBoundingClientRect().top;

      // Calculate the available height for the iframe
      const availableHeight = window.innerHeight - parentRect.height;

      // Calculate the desired height of the iframe

      // Set the height of the iframe

      // Check if the top of the iframe is about to leave the viewport
      if (iframeTop <= 0) {
        setIframeFixed(true);
      } else {
        setIframeFixed(false);
      }
    }
  }, 150);

  window.addEventListener('scroll', handleScroll);
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, [naturalHeight]); // Listen for changes in natural height

useEffect(() => {
  if (!iframeFixed && iframeRef.current) {
    // Store natural height when iframe is not fixed
    setNaturalHeight(iframeRef.current.offsetHeight);
  }
}, [iframeFixed]);


const [colorsItemsIndex, setColorsItemsIndex] = useState([''])

const show_colors_list = async (final_id) => {
    setShowColorsSelected(true); 
    const currentIndex = listefourniture.findIndex((parsedItem) => parsedItem.final_id === final_id);  
    setColorsItemsIndex(currentIndex)
};

const closeColorsModif = () =>{
  setShowColorsSelected(false)

} 

const [updatedColorsString, setUpdatedColorsString] = useState('');

const changeColors =() => {

  setShowColorsSelected(false)
}


const [parentColorsArray, setParentColorsArray] = useState('');
const handleColorsArrayChange = (colorsArray) => {
  setParentColorsArray(colorsArray);
  const countedColors = colorsArray.split(',').map(color => color.trim()).length;



setListefourniture(prevList => {
  const updatedList = [...prevList];
  updatedList[colorsItemsIndex].selected_color = colorsArray;
  updatedList[colorsItemsIndex].item_quantity = countedColors;

  return updatedList;
});
};

    // Handle select event
    const handleSelect = (selectedList) => {
      setSelectedOptions(selectedList);
    };
  
    // Handle remove event
    const handleRemove = (selectedList) => {
      setSelectedOptions(selectedList);
    };
  
  // Now displayed_listefourniture contains only the items that meet the filtering criteria
  

  useEffect(() => {
    const selectedOptionsArray = selectedOptions.map(item => item.Matiere_3);

    const updatedList = listefourniture.map(item => {
      if (selectedOptionsArray.includes(item.manuelle_matiere)) {
        return { ...item, to_display: true };
      } else {
        return { ...item, to_display: item.is_option === null ? true : false };
      }
    });

    setListefourniture(updatedList);
  }, [selectedOptions]);


useEffect(() => {
  if (listefourniture.length > 0) {
    const distinctMatieres = [
      ...new Set(
        listefourniture
          .filter((item) => item.is_option !== null)
          .map((item) => item.manuelle_matiere)
      ),
    ];


    const optionsToSelectData = distinctMatieres.map((matiere, index) => ({
      Matiere_3: matiere,
      id: index + 1,
    }));

    setOptionsToSelect(optionsToSelectData);
  }
}, [listefourniture]);

  
  return (
    <div className={`flex flex-col items-center justify-center w-auto ${isMobile ? '' : ''}`}>
    

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

                      { selectedClasse && options_to_select && options_to_select.length > 0 && (
                      <div className="p-2 m-2 border rounded-xl border-gray-300 bg-white"> 
                      Mes options:                    
                        <Multiselect
                          options={options_to_select}
                          selectedValues={selectedOptions}
                          displayValue="Matiere_3"
                          onSelect={handleSelect}
                          onRemove={handleRemove}
                          placeholder="Select matiere"
                        />                           
                        </div>
                        )} 


                    </div>

          </div>
          </div>
          ) : (
          <div className='w-full lg:w-1/2 flex flex-row justify-around items-center content-between mb-2'>
                  <img className='flex-shrink-0 p-2 bg-white' src={'/To_Do_List.png'} alt="User Profile" style={{ borderRadius: '50%', width: '200px', height: '200px' }} />
                    <div id=' dropdown_class_ecole' className="flex flex-col ">
                      <div className="p-2 m-2 border rounded-xl border-gray-600 bg-white w-auto">
                      <select id="dropdownEcole" className='w-full bg-white text-center' value={selectedEcole ?? ''} onChange={handleEcoleChange}>
                        <option value="" className='text-center bg-white w-max'>Ecole</option>
                        {[...new Set(ecoles)].map((ecole, index) => (
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

                      { selectedClasse && options_to_select && options_to_select.length > 0 && (
                      <div className="p-2 m-2 border rounded-xl border-gray-300 bg-white"> 
                      Mes options:                    
                        <Multiselect
                          options={options_to_select}
                          selectedValues={selectedOptions}
                          displayValue="Matiere_3"
                          onSelect={handleSelect}
                          onRemove={handleRemove}
                          placeholder="Espagnol"
                        />                           
                        </div>
                        )} 
                    </div>

                    <img className='flex-shrink-0 p-2 bg-white' src={'/to_do_list_2.png'} alt="User Profile" style={{ borderRadius: '50%', width: '200px', height: '200px' }} />
          </div>
        )}
        

        
        {/* display all items*/}
        {showProductList && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 border border-black rounded-lg w-3/4 h-3/4 overflow-y-auto z-50">
            
          {/* Close button */}
          <button
            onClick={handleCloseProductList}
            className="absolute top-0 left-0 text-red-500 px-2 py-1"
          >
            X
          </button>


          {/* tout les produit bouton Product List */}
          <div className='text-xl mb-4 font-bold'>{selectedcategory}</div>
              {isMobile? (<div className="flex flex-col justify-center">
        {fetchedProducts.map((product, index) => (
          <div key={product.id} className="flex flex-col items-center border rounded-2xl mb-3 last:border-b-0 p-4">
            <img className="w-36 h-36 mb-3" src={product.image} alt={product.name_to_display} />
            <div className="text-center mb-4">{product.name}</div>
            <div className="text-xl font-bold mb-4">{product.prix} Dnt</div>
            <button 
              className="font-bold p-2 border rounded-2xl"
              onClick={() => handleReplaceProduct(product)} // Adjust parameters as needed
            >
              Choisir cet article
            </button>
          </div>
        ))}
      </div>):(<table className="border-collapse border m-2 rounded-2xl w-full">
      <thead>
        <tr className="bg-gray-200">
        <th className="border p-2  justify-center flex">image</th>
        <th className="border p-2">Nom</th>
        <th className="border p-2">action</th>
        </tr>
      </thead>
      <tbody>

        {fetchedProducts.map((product) => (
          <tr key={product.id} className="border">
            <td className="border p-2">
              <img className="w-32 h-32 mb-3 p-2" src={product.image} alt={product.name_to_display} />
              </td>
              <td className="border p-2 flex-col justify-around">
              <div className="text-left line-clamp-2 mb-4">{product.nom}</div>
              <div className='flex justify-between'>
              <div className=' text-xl font-bold  mr-1' >{product.prix} Dnt</div>
              </div>
              </td>
              <td className="">
              <button 
              className="font-bold  p-2 border rounded-2xl"
              onClick={() => handleReplaceProduct(product)}
              >Choisir cet article</button>
              
            </td>
 
          </tr>
        ))}
      </tbody>
              </table>)}
        </div>
        )}

                {/* display all items*/}
          {showColorsSelected && (
          <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 border border-black rounded-lg  ${isMobile? 'w-1/2' : 'w-1/4 left-1/4 '}   z-50` }>
            
          {/* Close button */}
          <div className='relative'>
            
          <button
            onClick={closeColorsModif}
            className=" fixed left-0 border rounded-3xl text-red-500 px-2 py-1 text-3xl p-5 m-3 z-50"
            >
            X
          </button>
          </div>


          {/* tout les produit bouton Product List */}
          <div className={`mt-5 text-xl mb-4 font-bold flex items-center justify-around w-full relative` }>Modifier les couleurs</div>
          <img className={`${listefourniture[colorsItemsIndex].item_id?.charAt(0) === 'M' ? ' w-36 h-42 mb-3 p-2' : 'w-38 h-38 mb-3 p-2'}`} src={listefourniture[colorsItemsIndex].image } alt= {listefourniture[colorsItemsIndex].image}  />                             
          {listefourniture[colorsItemsIndex].available_colors ? <div className='flex text-xs justify-center items-center'>{renderColorDropdowns(listefourniture[colorsItemsIndex].available_colors, listefourniture[colorsItemsIndex].final_id)}</div>  :<div></div>}

          <RenderColorQuantities
        initialColorCounts={countColors(
          listefourniture[colorsItemsIndex].selected_color.split(',').map(color => color.trim())
        )}
        onColorsArrayChange={handleColorsArrayChange} 
              />
               <div className=' flex justify-center items-center'>
              <div className=' text-xl font-bold  mr-1'>{(listefourniture[colorsItemsIndex].prix * listefourniture[colorsItemsIndex].item_quantity).toFixed(2)} </div>
              <div className='mt-1 text-m font-bold flex-end'> Dnt</div>                                          
             </div>
          <button onClick={changeColors}  className=' border border-green-500 p-3  rounded-2xl mt-3 '> Valider mon choix de couleur</button>

        </div>
        )}
        
        {/*Display commande et liste*/}
          {selectedEcole && selectedClasse && (            
            <div className='flex flex-col items-center w-screen'>                    

            {/*Bouton commander liste et prix */}
            <div className=" flex-col rounded-xl p-4 mb-5 justify-between items-center bg-white w-auto border">
              <div className='text-s mb-2'>Tous mes livres neufs et toutes mes fournitures à</div>
          <div className="text-2xl font-bold mb-4">{totalSum} Dnt</div>
          <div className='flex flex-col'>
          <button className="bg-green-200 py-2 px-4 rounded-full mb-3" onClick={handleOrderCommand}>
          Je commande ma liste </button>
          <button className="bg-green-100 py-2 px-4 rounded-full  border" onClick={handleVentreLivre} >
          Je vend mes livres </button>
          </div>
        </div>

       {/*partie pub et bouton visualiser liste */}
       { isMobile ? 
    (
        <div className='bg-pink-50 border rounded-2xl p-4 mb-5'>
            <div className='p-2 mb-1'>Les produits de qualités les moins chers</div>
            <button className='mb-4' onClick={() => navigate('/MoyenPaiement')}>Paiement en 3x ou 4x</button>
            <div className=''>Livraison à domicile</div>

        </div>
    ) : (
        <div className=' w-2/3 mb-5 flex items-center justify-between bg-white border p-2 rounded-2xl'>
              <button className='bg-yellow-50 border rounded-2xl p-2' onClick={() => window.open('/MoyenPaiement', '_blank')}>Paiement en 3x ou 4x</button>
              <button className='bg-yellow-50 border rounded-2xl p-2' onClick={() => window.open('/ProduitQualite', '_blank')}>Les produits de qualités les moins chers</button>
              <button className='bg-yellow-50 border rounded-2xl p-2' onClick={() => window.open('/LivraisonDomicile', '_blank')}>Livraison à domicile</button>

        </div>
    )
}


        {lien_liste && lien_liste[0].lien_fourniture  && isMobile && 
        <Link className='border bg-white border-blue-500 rounded-2xl p-3 mb-5' to={lien_liste[0].lien_fourniture} target="_blank" >
        Visualisez la liste fournis par l'école
          </Link>}     
          <div className='flex justify-center mt-3 mr-4 ml-4 mb- 5 '>
        <div className={`flex flex-col bg-blue-50  border rounded-2xl  ${isMobile && !iframeFixed? '' : 'w-1/2'} ` }>
        <div className='text-center text-2xl p-3 font-bold'>Je personalise ma liste</div>

                <>
                {uniqueMatieres.map((uniqueMatiere, index) => (
                    <div key={index} className='w-full'>
                      <div className="border rounded-2xl p-2 m-3 bg-white">
                        <div className="flex flex-col w-full justify-center items-center">
                          <div className='flex w-full '>
                            <div className="mb-2 items-center font-bold text-xl text-center w-full">
                              {uniqueMatiere}
                            </div>
                            <div className="ml-auto">
                              {/*collaspe button*/}
                              <button className={`border rounded-3xl ${collapseStates[index] ? 'rotate-180' : ''}`} onClick={() => toggleCollapse(index)}>
                                <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M18.2929 15.2893C18.6834 14.8988 18.6834 14.2656 18.2929 13.8751L13.4007 8.98766C12.6195 8.20726 11.3537 8.20757 10.5729 8.98835L5.68257 13.8787C5.29205 14.2692 5.29205 14.9024 5.68257 15.2929C6.0731 15.6835 6.70626 15.6835 7.09679 15.2929L11.2824 11.1073C11.673 10.7168 12.3061 10.7168 12.6966 11.1073L16.8787 15.2893C17.2692 15.6798 17.9024 15.6798 18.2929 15.2893Z" fill="#0F0F0F"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          {/* Grid to display items for this matiere */}
                          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}  gap-4 text-center`}>
                  
                            {!collapseStates[index] && (    
                              <>  
                                        {/* Filter listefourniture for items with current matiere */}
                            {listefourniture.filter(item => item.matiere === uniqueMatiere  &&  (item.is_option === null || item.to_display === true)).map((filteredItem, filteredIndex) => (

                              <div key={filteredIndex}  className="border rounded-lg p-4 "> {/* Use a unique key */}
                              <div className=' w-full flex justify-end'>
                              <button className="" onClick={() => handleDeleteItem(filteredItem.final_id, filteredItem.matiere)} >
                              
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
                              
                              <Link to={`/Produits/${filteredItem?.item_id?.charAt(0) === 'M' ? 'Manuelle' : 'Fourniture'}/${filteredItem?.item_id}`} target="_blank">                            
                                <img className={`${filteredItem?.item_id?.charAt(0) === 'M' ? ' w-36 h-42 mb-3 p-2' : 'w-38 h-38 mb-3 p-2'}`} src={filteredItem.image } alt= {filteredItem.image}  />
                                </Link>                              
                                    {/* nom category etc*/}
                                <div className='flex flex-col h-4/5 justify-evenly w-full items-center'>
                                      <h2 className={`text-center text-xl mb-2 line-clamp-2 ${filteredItem?.item_id?.charAt(0) === 'M'  ? '2/3' : '1/3'} `}>                                
                                        {filteredItem?.item_id?.charAt(0) === 'M' ? (<>{filteredItem.name}</>) : <>{filteredItem.category}</>  }
                                        </h2>
                                        <h2 className={`text-center text-xs line-clamp-3  ${filteredItem?.item_id?.charAt(0) === 'M' ? '' : ''}`}>
                                        {filteredItem?.item_id?.charAt(0) === 'M' ? (<>ISBN: {filteredItem.isbn_numeric}</>) : <>{filteredItem.name}</>  }
                                        </h2>

                                        {filteredItem?.item_id?.charAt(0) === 'M' ? (
                                             <></>
                                              ) : (
                                            <div className={`flex mb-2 mt-2 ${isMobile ? 'flex-col justify-center items-center ' : 'flex justify-center items-center mt-2 '}`}>
                                              {filteredItem.similar_item && filteredItem.similar_item.length >0 ? (
                                                <div className={` flex justify-center items-center  ${isMobile ? 'mb-4 w-1/2' : ''}`}>
                                                  <button className='p-1 border border-gray-300 rounded-2xl text-xs' onClick={() => handleSimilarItemleft(filteredItem.item_id,filteredItem.similar_item, filteredItem.matiere,filteredItem.final_id)}>
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                      <path d="M5 12H19M5 12L11 6M5 12L11 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                  </button>                                                             
                                                  <button className='ml-2 p-1 border rounded-2xl  text-xs transform rotate-180' onClick={() => handleSimilarItemright(filteredItem.item_id,filteredItem.similar_item, filteredItem.matiere,filteredItem.final_id)}>
                                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M5 12H19M5 12L11 6M5 12L11 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                  </button>
                                                </div>
                                              ) : (
                                                <div></div>
                                              )}
                                                  <button className='ml-2 text-blue-300  justify-center border rounded-2xl text-xs w-min p-2' onClick={() => fetchProducts(filteredItem.category, filteredItem.subcategory, filteredItem.item_id, filteredItem.matiere,filteredItem.final_id)}>
                                                Tous les produits
                                              </button> 
                                            </div>
                                          )}
                                        
                                        {filteredItem.available_colors ? <div className='text-xs'>{renderColorDropdowns(filteredItem.available_colors, filteredItem.final_id)}</div>  :<div></div>}

                                  </div>
                                                                {/* prix qtt supprimer*/}
                              <>

                                <div className={`flex flex-col justify-center items-center border rounded-2xl p-2 ${isMobile ? 'flex-col' : ''}`}>       
                                <div className='flex items-center justify-center text-xs text-center w-full flex-col'>
                                    {filteredItem.selected_color === 'no color' ? (
                                      <> Quantité {filteredItem.item_quantity}</>
                                    ) : (
                                  
                                      filteredItem.selected_color ? (
                                        <div>
                                          <div className='font-bold'>Quantité:</div>
                                        {renderColorQuantities(countColors(filteredItem.selected_color.split(',').map(color => color.trim())),filteredItem.final_id)}
                                        </div>
                                      ) : (
                                        <> {filteredItem.item_quantity}</>
                                      )
                                    )}
                                  </div>       
                                <div className='text-xs flex items-center justify-center w-1/2'> 
                                     {filteredItem.selected_color === 'no color' ? <button className='  rounded-3xl border-black text-2xl h-auto mr-3' onClick={() => handleQuantityChange(filteredItem.final_id, +filteredItem.item_quantity - 1)}>-</button>: <></>}
                                      <div className=' flex flex-end'>
                                      <div className=' text-xl font-bold  mr-1'>{(filteredItem.prix * filteredItem.item_quantity).toFixed(2)} </div>
                                      <div className='mt-2 text-m font-bold flex-end'> Dnt</div>                                          
                                    </div>
                                    {filteredItem.selected_color === 'no color' ? <button className='  rounded-3xl border-black text-2xl h-auto ml-3'  onClick={() => handleQuantityChange(filteredItem.final_id, +filteredItem.item_quantity + 1)}>+</button>: <></>}
                                </div >
                                
           
                                        </div>
                              


                              </> 
                              {filteredItem?.item_id?.charAt(0) === 'M' ? (
                                <>
                              <div className='border m-2 rounded-2xl p-2 w-full bg-green-50 '>
                              <div className='text-xs'>J'opte pour un livre d'occasion</div>
                              <div className=' flex flex-end items-center justify-center'>
                                      <div className=' text-xl font-bold  mr-1'>{(filteredItem.prix/2 * filteredItem.item_quantity).toFixed(2)} </div>
                                      <div className='mt-2 text-m font-bold flex-end'> Dnt</div>                                          
                                    </div>
                              <div className='text-xs'>Qualité garantie</div>
                              </div>

                              </>
                              ) : ('')  }
                                </div>                           


               
                              </div>
                            ))}
                                {/*Ajouter un autre article button*/}                                                    
                                <div className="w-full flex border border-blue-100 rounded-lg p-4 items-center justify-center">
                                  <button
                                    onClick={toggleConstructionDiv} // Trigger the function on click
                                    className="border  border-black font-bold p-2 rounded-2xl">Ajouter un autre Article
                                  </button>
                                </div>
                              </>  
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                </>
        </div>
        { isMobile ? <></> :
        <div  id='test'  
        className={` w-1/2  z-0  ${iframeFixed ? '' : ''}`}>
          <div 
            ref={iframeRef}
            className={`border ml-2 ${iframeFixed ? '  flex items-center ' : 'relative h-full w-full'}`}>
          <iframe
          className={` z-0 ${iframeFixed ? ' fixed top-0 w-1/2 h-full' : 'h-full w-full relative'}`}
          src={lien_liste[0].lien_fourniture}

        ></iframe>
        </div>
</div> }

        </div>


            </div>
          )}




    </div>
  );
}