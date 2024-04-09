import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const Manuelle = ({ setManuelle_info }) => { // Destructure setManuelle_info directly from props
  const [manuelles, setmanuelles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Robert Desnos');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState('prix'); // Sort by price by default
  const [sortDirection, setSortDirection] = useState('desc'); // Descending order by default
  const [filterText, setFilterText] = useState('');



  useEffect(() => {
    const fetchData = async () => {
      try {
        let cachedmanuelles = sessionStorage.getItem('manuelles');
        if (cachedmanuelles) {
          cachedmanuelles = JSON.parse(cachedmanuelles);
          setmanuelles(cachedmanuelles);
        } else {
          const response = await axios.get('/produit_manuelles');
          sessionStorage.setItem('manuelles', JSON.stringify(response.data));
          setmanuelles(response.data);
        }
        setLoading(false);
      
    } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const cachedmanuelles = JSON.parse(sessionStorage.getItem('manuelles'));
    const uniqueCategories = [...new Set(cachedmanuelles.map((manuelle) => manuelle.ecole))];
    setCategories(uniqueCategories);
  }, [manuelles]);

  const handleCategoryChange = (ecole) => {
    setSelectedCategory(ecole);
  
    try {
      const cachedmanuelles = JSON.parse(sessionStorage.getItem('manuelles'));
      if (cachedmanuelles) {
        // Filter manuelles based on the selected category
        const filteredmanuelles = ecole ? cachedmanuelles.filter(manuelle => manuelle.ecole === ecole) : cachedmanuelles;
        // Extract unique subcategories from the filtered manuelles
        const uniqueSubcategories = [...new Set(filteredmanuelles.map(manuelle => manuelle.ecole))];
        
        // Update subcategories state and session storage
        setSubcategories(uniqueSubcategories);
        sessionStorage.setItem('subcategories', JSON.stringify(uniqueSubcategories));
        
        // Update manuelles state
        setmanuelles(filteredmanuelles);
      }
    } catch (error) {
      console.error('Error filtering manuelles:', error);
    } 
  };  

  const handleSubcategoryChange = (classe) => {
    setSelectedSubcategory(classe);
  };

  const handleSort = (column) => {
    if (column === sortColumn) {
      // If the same column is clicked again, reverse the sort direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If a new column is clicked, set it as the sort column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterTextChange = (text) => {
    setFilterText(text);
  };

   // Sorting function based on column and direction
   const sortedmanuelles = useMemo(() => {
    return [...manuelles].sort((a, b) => {
      if (sortColumn === 'prix') {
        const first = parseFloat(a[sortColumn]);
        const second = parseFloat(b[sortColumn]);
        const direction = sortDirection === 'asc' ? 1 : -1;
        return (first - second) * direction;
      } else {
        const first = a[sortColumn].toUpperCase();
        const second = b[sortColumn].toUpperCase();
        const direction = sortDirection === 'asc' ? 1 : -1;
        return first.localeCompare(second) * direction;
      }
    });
  }, [manuelles, sortColumn, sortDirection]);

  const handleAddToSelected = (product) => {
    setManuelle_info(product); // Use setManuelle_info function passed from props to update parent state
  };

  console.log('manuelles',manuelles)

  return (
    <div className='flex flex-col w-full m-5 items-center'>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
        <div className='flex' >

        <div className='m-2 border p-5 rounded-2xl'>
              <label htmlFor='filterText'>Filter by Name:</label>
              <input
                id='filterText'
                type='text'
                value={filterText}
                onChange={(e) => handleFilterTextChange(e.target.value)}
              />
            </div>

          <div className='m-2 border p-5 rounded-2xl'>
            <label htmlFor='category'>ecole:</label>
            <select id='category' value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value='all'>All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          
          <div className='m-2 border p-5 rounded-2xl'>
              <label htmlFor='subcategory'>classe:</label>
              <select
                id='subcategory'
                value={selectedSubcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
              >
                <option value='all'>All</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>

        

            </div>
          

          <table className='mt-5'>
            <thead>
              <tr>
              <th className='text-left'>
                  
                </th>

                <th className='text-left' onClick={() => handleSort('name')}>
                  Nom
                  {sortColumn === 'name' && (
                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
    
                <th className='text-left' onClick={() => handleSort('price')}>
                  Prix
                  {sortColumn === 'price' && (
                    <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedmanuelles
                .filter((manuelle) => !selectedCategory || manuelle.ecole === selectedCategory)
                .filter((manuelle) => !selectedSubcategory || manuelle.classe === selectedSubcategory || selectedSubcategory === 'all')
                .filter((manuelle) => manuelle.nom.toLowerCase().includes(filterText.toLowerCase())) // Filter by product name
                .map((manuelle) => (

                  <tr className='border'  key={manuelle.id}>
                    <td className='pr-4'> <img src={manuelle.image} alt={manuelle.nom} style={{ maxWidth: '100px', maxHeight: '100px' }} /></td>
                    <td className='text-left'>
                        <div className='flex'>
                    <div className='mr-5'>{manuelle.ecole}</div>
                    <div>{manuelle.classe}</div>
                    </div>

                    <div>{manuelle.name_to_display}</div>
                    </td>
                    <td className='text-left'>{manuelle.prix}</td>
                    <td  className='text-left pl-5'> <button onClick={() => handleAddToSelected(manuelle)}>Add to List</button> {/* Button to add product to selected list */}</td>
                  </tr>

                ))}
            </tbody>
          </table>
        </>
      )}

    </div>
    
  );
};

export default Manuelle;
