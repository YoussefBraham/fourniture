import React, { useEffect, useState } from 'react';
import axios from 'axios';


const Fournitures = ({ fournitures }) => {


  const [categories, setCategories] = useState(['Cahiers, Agendas & Carnets']);
    const [selectedCategory, setSelectedCategory] = useState('Cahiers, Agendas & Carnets');
    const [categories_2, setCategories_2] = useState(['Cahiers Spirales (wiro) & Registres', 'Cahiers Techniques (TP, récitation …)', 'Cahiers GM A4+ ( 24*32)', 'Cahiers Numérotés PM (N°12,24,48,72)', 'Carnets, Agendas & Papeterie Scolaire']);
    const [selectedCategorie2, setSelectedCategorie2] = useState('Cahiers Spirales (wiro) & Registres'); // State to store selected categorie_2
    const [fournitureCategories, setFournitureCategories] = useState([]);
    const [cachedData, setCachedData] = useState({}); // State to store cached data
    const [displayedProduct, setDisplayedProduct] = useState({}); // State to store filtered product data
    const [currentPage, setCurrentPage] = useState(1); // State to store current page number
    const [itemsPerPage, setItemsPerPage] = useState(5); // State to store items per page
    const [filterText, setFilterText] = useState('');
    const [sortBy, setSortBy] = useState(''); // 'price_asc', 'price_desc'

  //fetchInitialData
  useEffect(() => {
      const fetchInitialData = async () => {
          try {
              const cachedCategories = localStorage.getItem('cachedCategories');
              const cachedFournitureCategories = localStorage.getItem('cachedFournitureCategories');
              if (cachedCategories && cachedFournitureCategories) {
                  setCategories(JSON.parse(cachedCategories));
                  setFournitureCategories(JSON.parse(cachedFournitureCategories));
                  const response = await axios.get('/fournitures_by_category', {
                      params: {
                          category: 'Cahiers, Agendas & Carnets'
                      }
                  });
                  const responseData = response.data;
                  setCachedData(prevState => ({
                      ...prevState,
                      ['Cahiers, Agendas & Carnets']: responseData
                  }));
              } else {
                  const response = await axios.get('/fournitures_category');
                  const fetchedCategories = response.data;
                  setFournitureCategories(fetchedCategories);
                  const uniqueCategories = [...new Set(fetchedCategories.map(item => item.categorie_1))];
                  setCategories(uniqueCategories);
                  localStorage.setItem('cachedCategories', JSON.stringify(uniqueCategories));
                  localStorage.setItem('cachedFournitureCategories', JSON.stringify(fetchedCategories));
              }
          } catch (error) {
              console.error('Error fetching initial data:', error);
          }
      };
      fetchInitialData();
  }, []);
  
  const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        const selectedCategories = fournitureCategories.filter(item => item.categorie_1 === category);
        if (selectedCategories.length > 0) {
            const categorie2Array = selectedCategories.map(item => item.categorie_2);
            setCategories_2(categorie2Array);
            setSelectedCategorie2(categorie2Array[0])

        }

        if (cachedData[category]) {
            const filteredItems = cachedData[category].filter(item => categories_2.includes(item.categorie_2));
            setDisplayedProduct({ [category]: filteredItems });
        } else {
            try {
                const response = await axios.get('/fournitures_by_category', {
                    params: {
                        category: category
                    }
                });
                const responseData = response.data;
                setCachedData(prevState => ({
                    ...prevState,
                    [category]: responseData
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
           };
  
  const handleCategorie2Click = (categorie2) => {
      setSelectedCategorie2(categorie2); // Update selected categorie_2
  };

  // updatedDisplayedProduct
    useEffect(() => {
      const updatedDisplayedProduct = {};
      Object.keys(cachedData).forEach((category) => {
          const filteredItems = cachedData[category].filter((item) => item.categorie_2 === selectedCategorie2);
          updatedDisplayedProduct[category] = filteredItems;
      });
  
      // Check if displayedProduct is different from updatedDisplayedProduct
      if (JSON.stringify(displayedProduct) !== JSON.stringify(updatedDisplayedProduct)) {
          setDisplayedProduct(updatedDisplayedProduct);
      }
  }, [selectedCategorie2, cachedData]);
  
   useEffect(() => {
      const updatedDisplayedProduct = {};
      Object.keys(cachedData).forEach(category => {
          const filteredItems = cachedData[category].filter(item => categories_2.includes(item.categorie_2));
          updatedDisplayedProduct[category] = filteredItems;
      });
  
      // Check if displayedProduct is different from updatedDisplayedProduct
      if (JSON.stringify(displayedProduct) !== JSON.stringify(updatedDisplayedProduct)) {
          setDisplayedProduct(updatedDisplayedProduct);
      }
  }, [cachedData, categories_2]); 
  
  // Filter and sort displayed products based on filter text and sort criteria 
    useEffect(() => {
      let filteredItems = Object.values(displayedProduct)[0] || [];

      filteredItems = filteredItems.filter(item => item.description_1?.toLowerCase().includes(filterText.toLowerCase()));
      if (sortBy === 'price_asc') {
          filteredItems.sort((a, b) => a.prix_ttc - b.prix_ttc);
      } else if (sortBy === 'price_desc') {
          filteredItems.sort((a, b) => b.prix_ttc - a.prix_ttc);
      }
      setDisplayedProduct({ ...displayedProduct, [selectedCategory]: filteredItems });
  }, [filterText, sortBy, selectedCategory]); 

  // Calculate the total number of pages
  const totalPages = displayedProduct[selectedCategory] ? Math.ceil(Object.values(displayedProduct[selectedCategory]).length / itemsPerPage) : 0;

  // Generate an array of page numbers to display
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

      // Function to handle sorting change
      const handleSortByChange = (event) => {
        setSortBy(event.target.value);
      };
  
  // Function to handle sorting change
  const handleAddToListClick = (fournitureId) => {
    // Check if the item already exists in the list
    fournitures(fournitureId)
  };

  // Reset currentPage when selectedCategory changes
useEffect(() => {
  setCurrentPage(1);
}, [selectedCategory]);

      return (

          <div className='flex flex-col w-full m-5 items-center'>          
                {/*Category*/} 
                <div className='border bg-gray-50 rounded-2xl mb-3  w-4/5'>
                <div className='flex overflow-y-scroll h-full'>
                  {categories.map((element, index) => (
                    <div key={index} className={` flex items-center border p-2 rounded-2xl m-1 text-xs bg-white ${selectedCategory === element ? 'border-blue-500' : ''}`} onClick={() => handleCategoryClick(element)}>
                    <div className='w-full'>{element}</div>
                    </div>
                  ))}
                  </div>
                </div>
               
                {/*Sub Category*/}
                <div className='border bg-gray-50 rounded-2xl mb-3  w-4/5 '>
                <div className='flex overflow-y-auto '>
                      {categories_2.map((element, index) => (
                      <div
                          key={index}
                          className={`flex items-center border p-2 rounded-2xl m-1 text-xs bg-white ${selectedCategorie2 === element ? 'border-blue-500' : ''}`}
                          onClick={() => handleCategorie2Click(element)}
                        >
                    <div className='w-full'>{element}</div>
                        </div>
                    ))}
                    </div>
                </div>              
        
                <div className=' flex flex-col border  bg-blue-50 rounded-2xl  w-4/5 items-center justify-center '>
                <p className='mb-3'>Nombre d'articles: {displayedProduct[selectedCategory] && Object.values(displayedProduct[selectedCategory])?.length > 0 ? Object.values(displayedProduct[selectedCategory]).length : 0}</p>

                {/*Sort by price*/}
                <select
                value={sortBy}
                onChange={handleSortByChange}
                className="border rounded-xl p-2 m-1"
              >
                <option value="">Sort by price</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                </select>
                
                {/*displaying products*/}
                {Object.values(displayedProduct).map((items, index) => (

                    <div key={index} className='flex flex-col justify-center items-center mt-4'>
                      {items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, itemIndex) => (
                        <div key={itemIndex} className='flex  flex-wrap items-center justify-center border rounded-2xl bg-white mb-2 mr-5 ml-5 w-3/4'>
                          <img src={item.image} className="w-64 h-64 mb-3 rounded-3xl" alt={item.nom} />
                          <div className='flex flex-col w-full justify-center items-center p-3'>
                            <h2 className=' lowkey-text'>{item.nom}</h2>
                            <h2 className='text-xs'>{item.description_1}</h2>
                            <div className='flex mt-4  '>
                              <h2 className=' border rounded-2xl p-3 mr-3'>{item.prix_ht} ht</h2>
                              <h2 className=' border rounded-2xl p-3'>{item.prix_ttc} ttc</h2>
                            </div>                              
                            <button className='p-3 bg-green-200 m-2 rounded-2xl w-max' onClick={() => handleAddToListClick(item.fourniture_id)}>Ajouter au panier</button>
                          </div>
                        </div>
                      ))}
                    </div>
                ))}

                {/* pagination logic*/}
                <div className=' mt-3 '>
                    Page: 
                  <div className="flex justify-betweenitems-center mb-5 p-3 rounded-2xl">  
                    {pageNumbers.map((number, index) => {
                      // Always display page 1
                      if (number === 1 || number === totalPages ) {
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(number)}
                            className={currentPage === number ? 'border rounded-xl p-2 font-bold m-1' : 'border rounded-xl p-2 m-1'}
                          >
                            {number}
                          </button>
                        );
                      }
                      // Always display the last page
                      if (number === 1 || number === totalPages ) {
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(number)}
                            className={currentPage === number ? 'border rounded-xl p-2 font-bold m-1' : 'border rounded-xl p-2 m-1'}
                          >
                            {number}
                          </button>
                        );
                      }
                      // Display page numbers according to specified conditions
                      if (
                        (currentPage === 1 && number <= 2) ||
                        (currentPage === 2 && (number === 1 || number <= 4)) ||
                        (currentPage === 3 && (number === 1 || number <= 5)) ||
                        (currentPage > 3 && currentPage < totalPages - 2 && (number === 1 || (number >= currentPage - 1 && number <= currentPage + 1))) ||
                        (currentPage === totalPages - 2 && (number === 1 || number >= totalPages - 4)) ||
                        (currentPage === totalPages - 1 && (number === 1 || number >= totalPages - 3)) ||
                        (currentPage === totalPages && (number === 1 || number >= totalPages - 3))
                      ) {
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(number)}
                            className={currentPage === number ? 'border rounded-xl p-2 font-bold m-1' : 'border rounded-xl p-2 m-1'}
                          >
                            {number}
                          </button>
                        );
                      }
                      // Display ellipsis for pages not meeting the above conditions
                      if (
                        ( currentPage < totalPages - 2 && (number === 2 || number === totalPages - 1)) ||
                        ((currentPage === totalPages - 2 || currentPage === totalPages - 1 || currentPage === totalPages) && (number === 2 || number === totalPages - 2))
                      ) {
                        return <span className='border rounded-xl p-2' key={index}>...</span>;
                      }
                      return null;
                    })}
                  </div>
                </div>


                </div>     
                
              </div> )
      };

    export default Fournitures

