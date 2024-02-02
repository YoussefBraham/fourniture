import React from 'react'
import { auth, googleAuthProvider } from '/Users/youssefbraham/Desktop/Ri/client/firebase.js';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const navigate = useNavigate();

  const handleSignInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      console.log(result);
      const user = result.user;
      localStorage.setItem('token', result.user.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate("/compte");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <button className='border p-3' onClick={handleSignInWithGoogle}>Sign in with Google</button>
    </div>
  )
}

export default Login