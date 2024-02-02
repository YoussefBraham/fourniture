import React from 'react';
import { auth } from '/Users/youssefbraham/Desktop/Ri/client/firebase.js';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        // Redirect to the login page if the user is not signed in
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
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
          <button className='border mt-10' onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>No user signed in.</p>
      )}
    </div>
  );
};

export default AccountPage;
