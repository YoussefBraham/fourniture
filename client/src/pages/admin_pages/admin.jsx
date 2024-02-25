import React, { useState } from 'react';
import {Link} from "react-router-dom";
import { Navigate, useParams } from "react-router-dom";
import Products from './products.jsx'


import Creation_liste_scolaire from './creation_liste_scolaire.jsx'; 

export default function Admin() {

  let {subpage} = useParams()

  if (subpage === undefined) {
    return (

      <div className="flex-col  justify-center items-center h-full w-ful">
      <Link to='/admin/creation_liste_scolaire'className='border'> Saisir une liste de fourniture </Link>
  </div>
    )}

      // Define content for different subpages
  const subpageContents = {
    creation_liste_scolaire: <Creation_liste_scolaire/>,
  };

  const contentToRender = subpageContents[subpage] 
      
    return (
    <div className="flex-col  justify-center items-center h-full w-ful">
    <div className="p-5 w-full">
        {contentToRender}
      </div>
    </div>
    )}
      