import React, { useEffect, useState } from 'react';
import { auth, googleAuthProvider } from '../../firebase.js';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Panier = () => {
  const [user, setUser] = useState(null);
  const [panierData, setPanierData] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [totalPriceSum, setTotalPriceSum] = useState(0); // New state for sum


  const handleSignInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      console.log(result);
      const user = result.user;
      localStorage.setItem('token', result.user.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate("/panier");
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          try {const response = await axios.get(`/get_panier?user_id=${user.uid}`)
          const serverPanierData = response.data;
          const localStorageOrders = JSON.parse(localStorage.getItem('panier_local'));
          const localPanierMatch = JSON.stringify(localStorageOrders) === JSON.stringify(serverPanierData);
          console.log('localPanierMatch',localPanierMatch)
          if (!localPanierMatch) 
            {
              localStorage.setItem('panier_local', JSON.stringify(serverPanierData));
            }
           else {
          }

        
        }
          catch (error) {
            console.error('Error fetching panier:', error);
            localStorage.removeItem('panier_local');

          }
          const localStoragePendingPanier = JSON.parse(localStorage.getItem('pending_panier'));
          if (localStoragePendingPanier && localStoragePendingPanier.length > 0) {
            // Set the user ID in each item of pending_panier
            const updatedPendingPanier = localStoragePendingPanier.map(item => ({ ...item, user_id: user.uid }));
            await axios.post('/ajouter_panier', updatedPendingPanier[0]);                        

            // Merge the pending items with the existing panierData (if any)
            const mergedPanierData = panierData ? [...panierData, ...updatedPendingPanier] : updatedPendingPanier;
            // Update panierData state
            setPanierData(mergedPanierData);
            localStorage.removeItem('pending_panier');
            // Update local storage with the merged data
            localStorage.setItem('panier_local', JSON.stringify(mergedPanierData));
          } else {
            // Check if there are orders in local storage
            const localStorageOrders = JSON.parse(localStorage.getItem('panier_local'));
            if (localStorageOrders && localStorageOrders.length > 0) {
              // Set panierData from local storage
              setPanierData(localStorageOrders);
            } else {
              // If no orders in local storage, fetch from the server
              const response = await axios.get(`/get_panier?user_id=${user.uid}`);
              localStorage.setItem('panier_local', JSON.stringify(response.data));
              setPanierData(response.data);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        setPanierData(null);
      }
    });
  
    fetchData(); // Call fetchData immediately after mounting
  
    return () => unsubscribe();
  }, [user]); // Only run the effect when user changes
  
 
  const handleItemClick = (index) => {
    setClickedItem(clickedItem === index ? null : index);
  };


  const handleRemoveItemClick = async (panierId, userId) => {
    try {
      // Remove the item from the server
      await axios.delete(`/remove_item_from_cart?user_id=${userId}&panier_id=${panierId}`);
      // Remove the item from localStorage
      const existingData = JSON.parse(localStorage.getItem('panier_local')) || [];
      const updatedData = existingData.filter((item) => item.panier_id !== panierId);
      localStorage.setItem('panier_local', JSON.stringify(updatedData));
      setPanierData(updatedData);
      // Fetch updated data from the server
    } catch (error) {
      console.error('Error removing item from cart:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  const validatePanier = async () => {
    try {
      const localAddressData = JSON.parse(localStorage.getItem('delivery_info'));

      if (localAddressData) {
        // If address data is found in local storage, use it and set the state
        navigate('/checkout');
      } else {
        // If not found in local storage, fetch from the server
        const response = await axios.get(`/get_address?userId=${user.uid}`);

        if (response.status === 200 && response.data.length > 0) {
          // User address found, redirect to checkout
          navigate('/checkout');
        } else {
          // No address found, continue with address creation
          console.log('No address found. Continue with address creation.');
        }
      }
    } catch (error) {
        // Handle other errors, such as network issues
        console.error('Error checking user address:', error);
        // Redirect to address creation page
        navigate('/address');
    }
};

  return (
    <div className='flex flex-col items-center w-screnn'>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {user ? (
            <div className='w-screen'>
              <p className='mt-5 mb-3 text-3xl bg-white'>Mon Panier</p>

              <div className='flex justify-around'>
                <div className='flex'>

                  {panierData && panierData.length > 0? (
                    <div>
                <div className='flex justify-between'>
                    {
                  (panierData || []).map((panier, index) => (
                    <div className='m-2 flex flex-col bg-white h-full ' key={index}>
                      <div className='border p-5 rounded-2xl border-gray-200 flex flex-col h-full'>
                        {/* Nom de la fourniture */}
                        <div className='h-1/4'>
                        <div className='font-bold'>{panier.selected_ecole}</div>
                        <div className='font-bold mb-4'>{panier.selected_classe}</div>
                        </div>

                        {/* Description de la fourniture */}
                        <div className='h-1/2 p-3'>

                        {Array.isArray(panier.furniture_list)
                          ? panier.furniture_list.map((element, elementIndex) => (
                              <div key={elementIndex} className='flex flex-col'>
                                <div onClick={() => handleItemClick(elementIndex)} style={{ cursor: 'pointer'}} className='bg-blue-300 m-2 rounded-2xl'>
                                  {element.nom_matiere}
                                </div>

                                {clickedItem === elementIndex && (
                                  <div className='flex flex-col'>
                                    {(element.items || []).map((item, itemIndex) => (
                                      <div key={itemIndex} className='flex flex-row flex-nowrap justify-between items-baseline content-stretch'>
                                        <div className='mr-5  w-2/3 text-left p-1'>{item.name}</div>
                                        <div className='w-1/3'>Quantité: {item.quantity}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          : JSON.parse(panier.furniture_list).map((element, elementIndex) => (
                              <div key={elementIndex} className='flex flex-col'>
                                <div
                                  onClick={() => handleItemClick(elementIndex)}
                                  style={{ cursor: 'pointer'}}
                                  className='bg-purple-100 m-1 rounded-2xl'
                                >
                                  {element.nom_matiere}
                                </div>

                                {clickedItem === elementIndex && (
                                  <div className='flex flex-col'>
                                    {(element.items || []).map((item, itemIndex) => (
                                      <div key={itemIndex} className='flex flex-row flex-nowrap justify-between items-baseline content-stretch'>
                                        <div className='mr-5  w-2/3 text-left p-1'>{item.name}</div>
                                        <div className='w-1/3'>Quantité: {item.quantity}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                              </div>
                            ))
                        }
                        </div>

                        {/* Prix de la fourniture + bouton supprimer*/}
                        <div className='h-1/4 flex flex-col mb-2'>
                        <div className='mt-5 text-xl'>{panier.total_price} Dnt</div>
                        <button
                          className=' rounded-xl p-3 flex items-center justify-center' // Use "mt-auto" to push the button to the bottom
                          onClick={() => handleRemoveItemClick(panier.panier_id, panier.user_id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="red" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                        </div>


                      </div>
                    </div>
                  ))}
                   </div>

                {/* "Valider mon panier" button */}
                <div className=' mt-8 rounded-xl h-auto mb-10'>
                  <div className='text-2xl font-bold'>Total: {parseFloat(panierData.reduce((total, panier) => total + parseFloat(panier.total_price), 0))} Dnt</div>
                    <button
                    className='border rounded-xl bg-green-200 p-3 mt-3 text-xl'
                    onClick={validatePanier}
                  >
                    Valider mon panier
                  </button>
                  </div>

                  
                  </div>

                    
                  ) : (
                    
                    <p className='mb-10'>Mon panier est vide.</p>
                  )}
                </div>
                
                

              </div>
            </div>
          ) : (
            <>
            <div className='m-5 text-2xl font-bold p-3 bg-white'>Mon panier</div>
            <button className='border p-3 mt-10 bg-white mb-10' onClick={handleSignInWithGoogle}>Sign in with Google</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Panier;
