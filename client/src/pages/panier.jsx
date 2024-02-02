import React, { useEffect, useState } from 'react';
import { auth } from '/Users/youssefbraham/Desktop/Ri/client/firebase.js';
import axios from 'axios';


const Panier = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const response = await axios.get(`/get_panier?user_id=${user.uid}`);
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchData();
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleItemClick = (index) => {
    setClickedItem(clickedItem === index ? null : index);
  };

  return (
    <div className='flex flex-col items-center'>
      {user ? (
        <>
          <p>Bienvenue, {user.displayName}!</p>
          <p className='mb-10'>Mon Panier</p>

          {userData ? (
            userData.map((commande, index) => (
                <div>
              <div key={index} className='border p-3'>
                <div>{commande.selected_ecole}</div>
                <div>{commande.selected_classe}</div>

                {JSON.parse(commande.furniture_list).map((element, elementIndex) => (
                  <div key={elementIndex}>
                    <div onClick={() => handleItemClick(index)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                      {element.nom_matiere}
                    </div>

                    {clickedItem === index && (
                      <div>
                        {(element.items || []).map((item, itemIndex) => (
                          <div key={itemIndex}>
                            <div>Furniture_id: {item.furniture_id}</div>
                            <div>Quantity: {item.quantity}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className='mt-5'>{commande.total_price} Dnt</div>
              </div>
                        <button className='border rounded-xl mt-10 bg-gray-400 p-3'>Valider mon panier</button>
                        </div>


            ))
          ) : (
            <p>Mon panier est vide.</p>
          )}

        </>
      ) : (
        <p>No user signed in.</p>
      )}
    </div>
  );
};

export default Panier;
