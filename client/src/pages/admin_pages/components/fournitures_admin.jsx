import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const Fournitures_admin = ({ setFourniture_info }) => { // Destructure setFourniture_info directly from props
  const [fournitures, setFournitures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState('price'); // Sort by price by default
  const [sortDirection, setSortDirection] = useState('desc'); // Descending order by default
  const [filterText, setFilterText] = useState('');
  const [selectedColors, setSelectedColors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        let cachedFournitures = sessionStorage.getItem('fournitures');
        if (cachedFournitures) {
          cachedFournitures = JSON.parse(cachedFournitures);
          setFournitures(cachedFournitures);
        } else {
          const response = await axios.get('/produit_fournitures');
          sessionStorage.setItem('fournitures', JSON.stringify(response.data));
          setFournitures(response.data);
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
    const cachedFournitures = JSON.parse(sessionStorage.getItem('fournitures'));
    const uniqueCategories = [...new Set(cachedFournitures.map((fourniture) => fourniture.category))];
    setCategories(uniqueCategories);
  }, [fournitures]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  
    try {
      const cachedFournitures = JSON.parse(sessionStorage.getItem('fournitures'));
      if (cachedFournitures) {
        // Filter fournitures based on the selected category
        const filteredFournitures = category ? cachedFournitures.filter(fourniture => fourniture.category === category) : cachedFournitures;
        
        // Extract unique subcategories from the filtered fournitures
        const uniqueSubcategories = [...new Set(filteredFournitures.map(fourniture => fourniture.subcategory))];
        
        // Update subcategories state and session storage
        setSubcategories(uniqueSubcategories);
        sessionStorage.setItem('subcategories', JSON.stringify(uniqueSubcategories));
        
        // Update fournitures state
        setFournitures(filteredFournitures);
      }
    } catch (error) {
      console.error('Error filtering fournitures:', error);
    } 
  };  

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
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

  const sortedFournitures = [...fournitures].sort((a, b) => {
    if (sortColumn) {
      // Convert price to numbers before comparison
      const first = sortColumn === 'price' ? parseFloat(a[sortColumn]) : a[sortColumn].toUpperCase();
      const second = sortColumn === 'price' ? parseFloat(b[sortColumn]) : b[sortColumn].toUpperCase();
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortColumn === 'price') {
        return (first - second) * direction;
      }
      return first.localeCompare(second) * direction;
    }
    return 0;
  });

  const handleAddToSelected = (product) => {
  let productWithColor;

  // Check if 'available_colors' is not null or undefined before processing
  if (product.available_colors) {
    // Append the selected color to the product info
    const colors = parseAvailableColors(product.available_colors);
    const selectedColor = selectedColors[product.id] || (colors.length > 0 ? colors[0] : 'No colors available');

    productWithColor = {
      ...product,
      selectedColor: selectedColor
    };
  } else {
    // Assign default color if no colors are available
    productWithColor = {
      ...product,
      selectedColor: 'No color available'
    };
  }

  // Send the updated product info to the parent
  setFourniture_info(productWithColor);
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

  const handleColorChange = (productId, selectedColor) => {
    setSelectedColors(prevColors => ({
      ...prevColors,
      [productId]: selectedColor
    }));
  };

  const renderColorDropdowns = (colorsString,productId ) => {
    const dropdowns = [];
    const colors = parseAvailableColors(colorsString);
  

      dropdowns.push(
        <div key={`article-`} className="mb-4 flex w-full items-center"> {/* Added a unique key and a margin bottom */}
        <select className="bg-white border border-gray-300 rounded-md p-2 w-full "
                value={selectedColors[productId] || ''}
                onChange={e => handleColorChange(productId, e.target.value)}>
          {colors.map((color, index) => (
            <option key={`${index}`} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>
    );
  
  
    return dropdowns;
  };
  


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
            <label htmlFor='category'>Category:</label>
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
              <label htmlFor='subcategory'>Subcategory:</label>
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
              {sortedFournitures
                .filter((fourniture) => !selectedCategory || fourniture.category === selectedCategory)
                .filter((fourniture) => !selectedSubcategory || fourniture.subcategory === selectedSubcategory || selectedSubcategory === 'all')
                .filter((fourniture) => fourniture.name.toLowerCase().includes(filterText.toLowerCase())) // Filter by product name

                .map((fourniture) => (

                  <tr className='border'  key={fourniture.id}>
                    <td className='pr-4'> <img src={fourniture.product_picture} alt={fourniture.name} style={{ maxWidth: '100px', maxHeight: '100px' }} /></td>
                    <td className='text-left'>
                        <div className='flex'>
                    <div className='mr-5'>{fourniture.category}</div>
                    <div>{fourniture.subcategory}</div>
                    </div>

                    <div>{fourniture.name_to_display}</div>
                    {fourniture.available_colors && renderColorDropdowns(fourniture.available_colors, fourniture.id)}

                    </td>
                    <td className='text-left'>{fourniture.price}</td>
                    <td  className='text-left pl-5'> <button onClick={() => handleAddToSelected(fourniture)}>Add to List</button> {/* Button to add product to selected list */}</td>
                  </tr>

                ))}
            </tbody>
          </table>
        
        </>
      )}
    <Link className='mt-10' to='https://www.welcomeoffice.com/guides_achat/classement-et-archivage/42/les-differents-types-de-classeurs.aspx' target="_blank">
        <>Comprendre dimension Classeur</>
    </Link>
    </div>
    
  );
};

export default Fournitures_admin;
