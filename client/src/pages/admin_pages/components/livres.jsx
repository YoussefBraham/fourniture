import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Livres = ({ livreid }) => {
    // State variables for livre categories, selected niveau and categories, unique categories, cached data, and displayed data
    const [livreCategory, setLivreCategory] = useState([]);
    
    const [selectedNiveau, setselectedNiveau] = useState('Lycée');
    const [selectedCategory_1, setSelectedCategory_1] = useState('Lycée');
    const [selectedCategory_2, setSelectedCategory_2] = useState('Scolaire Lycee');

    const [uniqueNiveau, setUniqueNiveau] = useState(['Lycée','Collège','Primaire','Maternelle','Autre','Scolaire Tunisien']);
    const [uniqueCategory1, setUniqueCategory1] = useState(['Lycée','Cahier De Vacance','Guide Et Methode']);
    const [uniqueCategory2, setUniqueCategory2] = useState(['Scolaire Lycee','Parascolaire Lycee','Preparation Baccalaureat']);
   
    const [cachedData, setCachedData] = useState({});
    const [displayedData, setDisplayedData] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        const filteredData = Object.entries(cachedData).flatMap(([niveau, niveauData]) =>
            Object.entries(niveauData).flatMap(([category, books]) => {
                if (selectedCategory_2.length > 0) {

                    // If selectedCategory_2 is not null, filter based on both selectedCategory_1 and selectedCategory_2
                    return books.filter(book =>
                        book.category_1 === selectedCategory_1 && book.category_2 === selectedCategory_2
                    );
                } else {
                    // If selectedCategory_2 is null, filter only based on selectedCategory_1
                    return books.filter(book => book.category_1 === selectedCategory_1);
                }
            })
        );

        // Update displayedData state with filtered data
        setDisplayedData(filteredData);
    }, [cachedData, selectedCategory_1, selectedCategory_2]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = displayedData.slice(indexOfFirstItem, indexOfLastItem);

 // Calculate total number of pages
const totalPages = Math.ceil(displayedData.length / itemsPerPage);

// Generate an array of page numbers to display
const pageNumbers = [];
for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
}

  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


    // Fetching livre categories from backend on component mount
    useEffect(() => {
        axios.get('/livre_category')
            .then((response) => {
                const responseData = response.data;
                setLivreCategory(responseData);
            });
    }, []);

    // Function to fetch data from backend and cache it
    const fetchData = async (niveau, category) => {
        if (cachedData[niveau] && cachedData[niveau][category]) {
            return cachedData[niveau][category];
        } else { 
            const response = await axios.get('/livre_data', {params: {niveau: niveau, category: category}
        });
            const responseData = response.data;
            setCachedData(prevState => ({
                ...prevState,
                [niveau]: {
                    ...prevState[niveau],
                    [category]: responseData
                }
            }));
            return responseData;
        }
    };

    // Handler for niveau click
    const handleNiveauClick = async  (niveau) => {
        setselectedNiveau(niveau);
        const filteredCategories = livreCategory.filter(item => item.niveau === niveau);
        const uniqueCategory1 = [...new Set(filteredCategories.map(item => item.category_1))];
        setUniqueCategory1(uniqueCategory1);
        setSelectedCategory_1(uniqueCategory1[0]);
    };

    useEffect(() => {
        const fetchDataAndUpdateCategory2 = async () => {
            const data = await fetchData(selectedNiveau, selectedCategory_1);
            const uniqueCategory2Values = [...new Set(data.map(item => item.category_2))];
            
            if (uniqueCategory2Values.length > 0) {
                setUniqueCategory2(uniqueCategory2Values);
                setSelectedCategory_2(uniqueCategory2Values[0]);
            } else {
                // Handle the case when uniqueCategory2Values is empty
                // For example, you could set a default value for selectedCategory_2
                setSelectedCategory_2('');
            }
        };
    
        fetchDataAndUpdateCategory2();
    }, [selectedCategory_1, selectedNiveau]);
    


    // Handler for category 1 click
    const handleCategory1Click = async (category1) => {
        setSelectedCategory_1(category1);
        const data = await fetchData(selectedNiveau, category1);
        setUniqueCategory2([...new Set(data.map(item => item.category_2))])
        setSelectedCategory_2(data.map(item => item.category_2)[0]);

        ;
    };

    // Handler for category 2 click
    const handleCategory2Click = async (category2) => {
        setSelectedCategory_2(category2);
    };

    const handleAddToListClick = (isbn) => {
        // Check if the item already exists in the list
        livreid(isbn)
    };

    const visiblePages = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            visiblePages.push(i);
        }
    } else {
        // If totalPages is greater than 5, decide which pages to display
        if (currentPage <= 3) {
            // Display pages 1 to 5
            for (let i = 1; i <= 5; i++) {
                visiblePages.push(i);
            }
        } else if (currentPage >= totalPages - 2) {
            // Display the last 5 pages
            for (let i = totalPages - 4; i <= totalPages; i++) {
                visiblePages.push(i);
            }
        } else {
            // Display the current page and the two pages before and after it
            for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                visiblePages.push(i);
            }
        }
    }


    return (
        <div className='flex flex-col w-full m-5 items-center'>          

            {/* Render niveau categories */}
            <div className=' flex justify-center border bg-gray-50 rounded-2xl mb-3  w-4/5'>
                {uniqueNiveau.map((niveau, index) => (
                    <div key={index} className={`flex items-center m-2 p-1 bg-white border rounded-2xl text-sm ${selectedNiveau === niveau ? 'border-blue-500' : ''}`} onClick={() => handleNiveauClick(niveau)}>
                <div className='w-full'>{niveau}</div>
                    </div>
                ))}
            </div>

            {/* Render category 1 */}
            <div className=' flex justify-center border bg-gray-50 rounded-2xl mb-3  w-4/5'>
                {uniqueCategory1.map((category1, index) => (
                    <div key={index} className={`flex items-center m-2 p-1 bg-white border rounded-2xl text-sm ${selectedCategory_1 === category1 ? 'border-blue-500' : ''}`} onClick={() => handleCategory1Click(category1)}>
                        {category1}
                    </div>
                ))}
            </div>

            {/* Render category 2 */}
            <div className=' flex justify-center border bg-gray-50 rounded-2xl mb-3  w-4/5'>
                {uniqueCategory2.map((category2, index) => (
                    <div key={index} className={`m-2 p-1 bg-white border rounded-2xl text-sm ${selectedCategory_2 === category2 ? 'border-blue-500' : ''}`} onClick={() => handleCategory2Click(category2)}>
                        {category2}
                    </div>
                ))}
            </div>

            {/* Render displayed data */}
            <div className='p-2 flex flex-col border  bg-blue-50 rounded-2xl  w-4/5 items-center justify-center '>
                {currentItems.map((index) =>
                    <div className='flex flex-col flex-wrap items-center justify-center border rounded-2xl bg-white mb-2 mr-5 ml-5 w-3/4'>
                        <div>{index.name}</div>
                        <img src={index.image} className="w-64 h-64 mb-3 rounded-3xl" alt={index.name} />
                        <div className=' border rounded-2xl p-3'>{index.prix_ttc} Dnt</div>
                        <button className='p-3 bg-green-200 m-2 rounded-2xl w-max' onClick={() => handleAddToListClick(index.isbn)}>Ajouter au panier</button>

                    </div>

                )}
            </div>


            {/* Pagination */}
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
    );
};

export default Livres;
