import React, { useEffect, useState } from 'react';
import { auth } from '/Users/youssefbraham/Desktop/Ri/client/firebase.js';
import axios from 'axios';

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        
        try {
          // Make Axios request to fetch orders based on user ID
          const response = await axios.get(`/get_orders_by_user?user_id=${user.uid}`);
          setOrders(response.data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Redirect to the home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className='flex flex-col items-center'>
      {user ? (
        <>
          <img className='mt-10 mb-10' src={user.photoURL} alt="User Profile" style={{ borderRadius: '50%', width: '100px', height: '100px' }} />
          <p>Welcome, {user.displayName}!</p>
          <p>Email: {user.email}</p>

          <div className='border rounded-2xl  p-5 mt-5 bg-white'>
            <h2 className='mb-7 text-xl font-bold'>Mes commandes</h2>
            <ul>
              {orders.map((order) => (
                <li key={order.order_id}>
                  <div>Numéro de commande: {order.order_id}</div>
                  <div>Statut: En cours de préparation</div>
                </li>
              ))}
            </ul>
          </div>
          <button className=' rounded-2xl font-bold mt-10 p-3 mb-10 bg-white' onClick={handleLogout}>Se déconnecter</button>
        </>
      ) : (
        <div className='flex flex-col '>
        <div className='m-5 text-2xl font-bold p-3 bg-white'>Mon compte</div>
        <button className='border p-3 mt-10 bg-white mb-10' onClick={handleSignInWithGoogle}>Sign in with Google</button>
        </div>

      )}
    </div>
  );
};

export default AccountPage;
