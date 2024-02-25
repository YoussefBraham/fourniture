import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, linkWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSignInWithGoogle = async () => {
    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem('token', result.user.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Rest of your code for updating pending orders

      navigate('/panier');
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignInWithFacebook = async () => {
    try {
      const facebookProvider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
  
      // Check if the user is already signed in with a different provider
  
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
  
      // Rest of your code for handling Facebook authentication
  
      navigate('/panier');
    } catch (error) {
      console.error('Error signing in with Facebook:', error.code, error.message);

    }
  };
  

  

  return (
    <div className='flex flex-col'>
      <button className='border p-3 m-5' onClick={handleSignInWithGoogle}>Sign in with Google</button>
      {/*<button className='border p-3 m-5' onClick={handleSignInWithFacebook}>Sign in with Facebook</button>*/}
    </div>
  );
};

export default Login;
