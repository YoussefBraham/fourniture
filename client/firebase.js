// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzm5NyxjCh8abV4PKllgSsVsaaa82DWNg",
  authDomain: "founitures-6f03c.firebaseapp.com",
  projectId: "founitures-6f03c",
  storageBucket: "founitures-6f03c.appspot.com",
  messagingSenderId: "895173319654",
  appId: "1:895173319654:web:57b2fbef49675a91e99427"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Pass the initialized app to getAuth
const googleAuthProvider = new GoogleAuthProvider(); // Create a new instance of GoogleAuthProvider

export { app, auth, googleAuthProvider };