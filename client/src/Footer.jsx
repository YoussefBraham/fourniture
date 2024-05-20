import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-blue-50 p-4 text-center  w-full mt-10 z-50" >
      <div className="flex justify-around">
        <div>
          <ul className='flex'>
            <li className='m-2'>
              <Link to="/carriere">Carrière</Link>
            </li>
            <li className='m-2'>
              <Link to="/QuiSommesNous">Qui sommes-nous ?</Link>
            </li>
            <li className='m-2'>
              <Link to="/contact">Contacts</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-4">&copy; 2024 fournitures </p>
      <p>  All rights reserved</p>
    </footer>
  );
};

export default Footer;
