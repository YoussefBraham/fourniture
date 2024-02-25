import React, { useState, useEffect } from 'react';
import { auth } from '/Users/youssefbraham/Desktop/Ri/client/firebase.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios

const Checkout = () => {
  const [user, setUser] = React.useState(null);
  const [panierData, setPanierData] = useState(null);
  const [Address, setAddress] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);  // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          // Check if panierData is available in local storage
          const localPanierData = JSON.parse(localStorage.getItem('panier_local'));
          if (localPanierData && localPanierData.length > 0) {
            setPanierData(localPanierData);
          } else {
            // Fetch panierData from the server
            const responsePanier = await axios.get(`/get_panier?user_id=${user.uid}`);
            // Save panierData to local storage for future use
            localStorage.setItem('panier_local', JSON.stringify(responsePanier.data));
            const localPanierData = JSON.parse(localStorage.getItem('panier_local'));
            setPanierData(localPanierData);

          }
  
          // Check if Address is available in local storage
          const localAddress = JSON.parse(localStorage.getItem('delivery_info'));
          console.log('localAddress',localAddress)
          if (localAddress && localAddress.length > 0) {
            setAddress(localAddress);
          } else {
            const responseAddress = await axios.get(`/get_address?userId=${user.uid}`);
            localStorage.setItem('delivery_info', JSON.stringify(responseAddress.data[0]));
            const localAddress = JSON.parse(localStorage.getItem('delivery_info'));
            setAddress(localAddress);


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
        fetchData();
      } else {
        setUser(null);
        setPanierData(null);
        setAddress([]);
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, [user]);
  

  const handlePaymentMethodChange = (newPaymentMethod) => {
    setPaymentMethod(newPaymentMethod);
  };

  const handleCheckout = async () => {
    try {
      // Assuming the checkout process is successful
      // You can add more logic here to handle the payment process
  
      // Make a POST request to your backend to place an order
      const responsePlaceOrder = await axios.post('/place_an_order', {
        order_id: generateOrderId(), // Replace with your actual order_id generation logic
        user_id: user.uid,
        panierData: panierData,
      });
  
      console.log('Order successfully submitted:', responsePlaceOrder.data);
  
      // Delete the content of the shopping cart in the backend
      const responseDeleteCart = await axios.delete(`/delete_panier?user_id=${user.uid}`);
  
      console.log('Shopping cart content deleted:', responseDeleteCart.data);
  
      // Redirect to the /compte page after successful checkout
      navigate('/compte');
    } catch (error) {
      console.error('Error submitting order:', error);
      // Handle errors as needed
    }
  };
  

  const generateOrderId = () => {
    // Get current timestamp in milliseconds
    const timestamp = Date.now();
  
    // Generate a random string (you can use a more sophisticated logic if needed)
    const randomString = Math.random().toString(36).substring(7);
  
    // Combine timestamp and random string to create the order ID
    const orderId = `${timestamp}-${randomString}`;
  
    return orderId;
  };
  
  const isMobile = window.innerWidth <= 500; // Adjust the threshold as needed


  return (
<div className='flex flex-col w-screen justify-center items-center '>
      <h2 className="text-2xl font-bold mb-5">Checkout</h2>

      {/* Display Order Summary */}
      <div className={`border rounded-xl p-2  bg-white  ${isMobile ? 'w-auto' : 'w-1/2'}`}>
      <h3 className='mb-2 text font-bold'>Commande</h3>
      <div className="mb-2  flex flex-col items-center justify-center ">
        {panierData && panierData.length > 0 ? (
          panierData.map((panier, index) => (            
            <div className='text-left mt-2 mb-2 w-full ' key={index}>
              <div className=' flex border rounded-2xl p-3 justify-between'>
                <div>
                <div className='text-left'>{panier.selected_ecole}</div>
                <div>{panier.selected_classe}</div>
                </div>
                <div className='mt-5'>{panier.total_price} Dnt</div>
              </div>
            </div>
          )
          )
        ) : (
          <p>Vous n'avez aucune commande.</p>
        )}
      </div>
      </div>

      {/* Display Delivery Address */}
      <div className={`mt-3 border rounded-xl p-2  bg-white  ${isMobile ? 'w-auto' : 'w-1/2'}`}>
        <h3 className='font-bold mb-2'>Informations de livraison</h3>
        <div>
        <>
            <div> {Address.address}</div>
            <div> Tel: {Address.phone_number}</div>
            <div> date: </div>

        </>
        

        </div>
      </div>


      {/* Display payment method */}
      <div className={`mt-3 border rounded-xl p-2  bg-white  ${isMobile ? 'w-auto' : 'w-1/2'}`}>
      <h3 className='mb-5 text font-bold'>Paiement</h3>
      <div className='flex justify-around'>
        <label             className='m-2'>
          <input
            type="radio"
            value="creditCard"
            checked={paymentMethod === 'creditCard'}
            onChange={() => handlePaymentMethodChange('creditCard')}
            className='m-1'
          />
          Carte de Crédit
        </label>
        <label             className='m-2'>
          <input
            type="radio"
            value="cashOnDelivery"
            checked={paymentMethod === 'cashOnDelivery'}
            onChange={() => handlePaymentMethodChange('cashOnDelivery')}
            className='m-1'
          />
           Cash à la livraison
        </label>  
      </div>
        {paymentMethod === 'creditCard' && (
          <div className="mb-5 mt-5">
            <form>
              <label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Enter card number"
                />
              </label>
              <label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="Enter CVC"
                />
              </label>
              <label>
                <input
                  type="text"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  placeholder="MM/YYYY"
                />
              </label>
            </form>
          </div>
        )}
      </div>


      {/*valider le paiement */}
      <button
        className="bg-green-300 py-2 px-4 rounded-full mt-5 mb-10 font-bold text-xl"
        onClick={handleCheckout}
        /*disabled={!paymentMethod || (paymentMethod === 'creditCard' && (!cardNumber || !cvc || !expirationDate))} */
      >
        Valider mon paiement
      </button>
    </div>
  );
};

export default Checkout;
