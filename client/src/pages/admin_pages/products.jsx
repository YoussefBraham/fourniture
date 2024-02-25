import React, { useState } from 'react';
import Fournitures from './components/fournitures.jsx';
import Livres from './components/livres.jsx';

const Products = ({fourniturelist2} ) => {
  const [showFournitures, setShowFournitures] = useState(false);
  const [showLivres, setShowLivres] = useState(false);
  const [fournitureslist1, setFourniturelist1] = useState(null);
  const [livre, setLivre] = useState(null);

  // Function to receive data from child
  const handleDataFromChild = (data) => {
    setFourniturelist1(data);
  };


    // Function to receive livre from child
    const handleLivreChild = (data) => {
      setLivre(data);
    };

    fourniturelist2(fournitureslist1)
  

  return (
    <div className='flex flex-col w-full h-full items-center'>
      <div className='flex justify-around'>
        <button
          className='p-3 m-2 bg-yellow-50 rounded-2xl'
          onClick={() => {
            setShowFournitures(true);
            setShowLivres(false); // Make sure only one type is shown
          }}
        >
          Fournitures
        </button>
        <button
          className='p-3 m-2 bg-yellow-50 rounded-2xl'
          onClick={() => {
            setShowLivres(true);
            setShowFournitures(false); // Make sure only one type is shown
          }}
        >
          Livres
        </button>
      </div>

      {showFournitures && <Fournitures  fournitures={handleDataFromChild}  />} {/* Use lowercase for function name */}

      {showLivres && <Livres  livreid = {handleLivreChild} />}

    </div>
  );
};

export default Products;
