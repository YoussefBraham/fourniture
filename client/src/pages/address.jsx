import React, { useState, useEffect } from 'react';
import { auth } from '/Users/youssefbraham/Desktop/Ri/client/firebase.js';
import { useNavigate } from 'react-router-dom';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import axios from 'axios'; // Import Axios


const Address = () => {
  const [user, setUser] = React.useState(null);
  const [address, setAddress] = useState('');
  const [phone_number, setphone_number] = useState(''); // New state for phone number
  const [suggestions, setSuggestions] = useState([]);
  const [isAddressFound, setIsAddressFound] = useState(false); // New state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          // Check if the address data exists in local storage
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
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        // Call fetchData here
        fetchData();
      } else {
        setUser(null);
        navigate('/login');
      }
    });

    // Cleanup function
    return () => {
      unsubscribe(); // Unsubscribe from the auth state change when the component unmounts
    };
  }, [navigate, user]);
  

  const handleAddressChange = (newAddress) => {
    setAddress(newAddress);
    setIsAddressFound(false); // Reset the state when the address changes

    geocodeByAddress(newAddress)
      .then((results) => {
        setSuggestions(results.map((result) => result.description));
      })
      .catch((error) => console.error('Error', error));
  };

  const handlephone_numberChange = (newphone_number) => {
    setphone_number(newphone_number);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    // Check if the address is found and a valid phone number is provided
    if (isAddressFound && phone_number) {
      try {
        // Add logic here to handle the submission to your backend
        const response = await axios.post('/submit_address', {
          user_id: user.uid,
          address,
          phone_number,
        });
  
        // Check if the response indicates success
          // Save the data to local storage
          const addressData = {
            user_id: user.uid,
            address,
            phone_number,
          };
          localStorage.setItem('delivery_info', JSON.stringify(addressData));
  
          // Continue with the navigation to checkout
          navigate('/checkout');
        
      } catch (error) {
        console.error('Error submitting data to backend:', error);
      }
    } else {
      console.log('Incomplete information provided.');
    }
  };
  
  

  const handleSelect = (selectedAddress) => {
    setAddress(selectedAddress);
    setIsAddressFound(true); // Set the state when the address is found
    setSuggestions([]);

    geocodeByAddress(selectedAddress)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => console.log('Success', latLng))
      .catch((error) => console.error('Error', error));
  };


  
  return (
    <div className='flex flex-col items-center'>
      {user ? (
        <div className='flex flex-col items-center w-2/3'>
          <p>Welcome, {user.displayName}!</p>
          <form className='flex flex-col items-center mt-5 border rounded-xl p-10 w-full' onSubmit={handleFormSubmit}>
            <PlacesAutocomplete
              value={address}
              onChange={handleAddressChange}
              onSelect={handleSelect}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div>
                  <input
                    {...getInputProps({
                      placeholder: 'Saisir mon adresse de livraison',
                      className: 'location-search-input',
                      style: { width: '250px' },
                    })}
                  />
                  <div className="autocomplete-dropdown-container">
                    {loading && <div>Loading...</div>}
                    {suggestions.map((suggestion, index) => {
                      const className = suggestion.active
                        ? 'suggestion-item--active'
                        : 'suggestion-item';
                      const style = suggestion.active
                        ? { backgroundColor: 'bg-gray-400', cursor: 'pointer' }
                        : { backgroundColor: 'bg-gray-400', cursor: 'pointer' };
                      return (
                        <div
                          key={index}
                          {...getSuggestionItemProps(suggestion, {
                            className,
                            style,
                          })}
                        >
                          <span>{suggestion.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
            <input
              type="tel"
              placeholder="Mon numéro de telephone"
              value={phone_number}
              onChange={(e) => handlephone_numberChange(e.target.value)}
              className="location-search-input mt-3"
            />
             <button
              type="submit"
              className={`border rounded-xl mt-5 p-2 ${
                isAddressFound && phone_number.length >= 8 && phone_number.length <= 15
                  ? 'bg-blue-400'
                  : 'bg-gray-400'
              } ${
                isAddressFound && phone_number.length >= 8 && phone_number.length <= 15
                  ? ''
                  : 'opacity-50 cursor-not-allowed'
              }`}              disabled={!isAddressFound || phone_number.length < 8 || phone_number.length > 15}
            >Enregistrer mon adresse</button>
          </form>
        </div>
      ) : (
        <p>No user signed in.</p>
      )}
    </div>
  );
};

export default Address;
