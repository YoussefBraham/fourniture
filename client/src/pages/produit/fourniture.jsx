import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';


function FourniturePage() {
  const { fourniture_id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Fetch product details using the productId
    // This is a placeholder for your actual data fetching logic
    const fetchProduct = async () => {
      try {
        console.log('fourniture_id',fourniture_id)
        const response = await   axios.get(`/Fourniture/${fourniture_id}`); // Adjust the API endpoint as needed
        const data = await response.data;
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [fourniture_id]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-screen h-full relative" >
            <div className="flex  flex-col justify-center items-center border border-rounded-2xl" >
      <img  className="mb-3" src={product.product_picture} alt={product.name_to_display} style={{ width: '20%', height: '40%' }} />
      <h1 className='m-4'>{product.name}</h1>
      <p className='text-xs w-1/2'>{product.description}</p>
      <p className='font-bold m-3 p-2 border rounded-2xl'>{product.price} Dnt</p>
    </div>
    </div>
  );
}

export default FourniturePage;
