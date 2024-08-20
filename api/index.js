const functions = require('firebase-functions');
const express = require("express");
const app = express();
const cors = require("cors")
const { v4: uuidv4 } = require('uuid');
const  pool = require('./db'); 

app.use(cors({ 
  origin: ['https://founitures-6f03c.web.app','http://localhost:5173'],
  credentials: true, 
}));

app.use(express.json())  
  
  app.get('/ecoles', async (req, res) => {
  try {
      const response = await pool.query("SELECT distinct ecole, classe FROM fourniture_classes_2 where annee_scolaire = '2024/2025' order by ecole, classe");
      res.json(response.rows);}
  catch  (error) {
      console.log("erreur_ecole_1",  error )}});

  app.get('/ecoles_2', async (req, res) => {
        try {
            const response = await pool.query("SELECT  *  FROM ecoles");
            res.json(response.rows);}
        catch{
            console.log("erreur_ecole_2");}});
    
  app.get('/similarItems', async (req, res) => {
    const { similar_item_id } = req.query;
        try {
            const response = await pool.query("SELECT  *  FROM produits_fournitures where id = $1 ",[similar_item_id]);
            res.json(response.rows);}
        catch{
            console.log("erreur_simar_item");}})
 
  app.get('/fournitures', async (req, res) => {
        try {
            const response = await pool.query("SELECT * FROM fournitures");
            res.json(response.rows);}
        catch{
  }});

  app.get('/fournitures_by_selection', async (req, res) => {
                try {
                  const { ecole, classe, matiere } = req.query;
                  const response = await pool.query("SELECT * FROM fourniture_classes_2 WHERE ecole = $1 AND classe = $2 AND matiere = $3  and annee_scolaire = '2024/2025' order by display_order", [ecole, classe, matiere]);
                  res.json(response.rows);
                } catch (error) {
                  console.error('Error fetching data:', error);
                  res.status(500).json({ error: 'Internal Server Error' });
                }
  });

  app.post('/creation_liste', async (req, res) => {
    try {
        const { ecole, classe, matiere, selectedItems } = req.body;

        // Check if the data already exists in the database
        const existingDataQuery = `
            SELECT * FROM fourniture_classes
            WHERE nom_ecole = $1 AND nom_classe = $2 AND nom_matiere = $3
        `;
        const existingDataResponse = await pool.query(existingDataQuery, [ecole, classe, matiere]);
        const existingData = existingDataResponse.rows[0];

        if (existingData) {
            // If data exists, update the existing record
            const updateQuery = `
                UPDATE fourniture_classes
                SET fourniture_list = $1
                WHERE nom_ecole = $2 AND nom_classe = $3 AND nom_matiere = $4
            `;
            await pool.query(updateQuery, [selectedItems, ecole, classe, matiere]);

            res.status(200).json({ message: 'Data updated successfully' });
        } else {
            // If data doesn't exist, insert a new record
            const insertQuery = `
                INSERT INTO fourniture_classes (nom_ecole, nom_classe, nom_matiere, fourniture_list)
                VALUES ($1, $2, $3, $4)
            `;
            await pool.query(insertQuery, [ecole, classe, matiere, selectedItems]);

            res.status(200).json({ message: 'Data inserted successfully' });
        }
    } catch (error) {
        console.error('Error inserting/updating data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/creation_liste_2', async (req, res) => {
    const client = await pool.connect();
    try {
      const transformedItems = req.body;

      // Begin the transaction
      await client.query('BEGIN');

      // Delete existing rows based on ecole, classe, and matiere
      const { ecole, classe, matiere } = transformedItems[0]; // Assuming all items have the same ecole, classe, and matiere
      const deleteQuery = `
        DELETE FROM fourniture_classes_2 
        WHERE ecole = $1 AND classe = $2 AND matiere = $3 
      `;
      await client.query(deleteQuery, [ecole, classe, matiere]);

      // Construct the INSERT query
      const insertQuery = `
        INSERT INTO fourniture_classes_2 
        (ecole, classe, matiere, matiere_order, item_id, item_quantity, selected_color, similar_item, display_order, final_id, is_option)
        VALUES ${transformedItems.map((_, index) => `($${index * 11 + 1}, $${index * 11 + 2}, $${index * 11 + 3}, $${index * 11 + 4}, $${index * 11 + 5}, $${index * 11 + 6}, $${index * 11 + 7}, $${index * 11 + 8}, $${index * 11 + 9}, $${index * 11 + 10}, $${index * 11 + 11})`).join(',')}
      `;

      // Flatten the transformedItems array to construct values for insertion
      const values = transformedItems.flatMap(item => [
        item.ecole,
        item.classe,
        item.matiere,
        item.matiere_order,
        item.item_id,
        item.item_quantity || 1,
        item.selected_color || 'no color',
        JSON.stringify(item.similar_item), // Convert similar_item to JSON string
        item.display_order || 1,
        item.final_id || 1,
        item.is_option
      ]);

      // Execute the query with the provided parameters
      await client.query(insertQuery, values);

      // Commit the transaction
      await client.query('COMMIT');

      res.status(200).json({ message: 'Data submitted successfully' });
    } catch (error) {
      // Rollback the transaction in case of error
      await client.query('ROLLBACK');
      console.error('Error submitting data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  });

  app.get('/all_fourniture_classe_2', async (req, res) => {
    try {
      const { ecole, classe } = req.query;
      const response = await pool.query(
        "SELECT fc2.*, coalesce(pf.name_to_display, pm.name_to_display) name, coalesce(pm.prix, pf.prix) prix,isbn_numeric, pf.available_colors, coalesce(pf.image, pm.image) image, pf.category, final_id, pm.matiere manuelle_matiere FROM fourniture_classes_2 fc2 left join produits_fournitures pf on fc2.item_id= pf.id  left join produits_manuelles pm on fc2.item_id = pm.id  WHERE fc2.ecole = $1 AND fc2.classe = $2  and annee_scolaire = '2024/2025' order by matiere_order,display_order", [ecole, classe]);
      res.json(response.rows); 
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/lien_liste', async (req, res) => {
    try {
      const { ecole, classe } = req.query;
      const response = await pool.query("SELECT * FROM lien_liste WHERE nom_ecole = $1 AND classe = $2 and annee_scolaire = '2024/2025'", [ecole, classe]);
      res.json(response.rows); 
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
    
  app.post('/ajouter_panier', async (req, res) => {
    try {
      // Extract the necessary information from the request body
      const { user_id, selected_ecole, selected_classe, furniture_list, total_price } = req.body;
      const panier_id = req.body.panier_id; // Extract panier_id separately

      // Construct the SQL query to insert order details into the 'orders' table
      const query = `
        INSERT INTO paniers (user_id, selected_ecole, selected_classe, panier_id, furniture_list, total_price)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;  
      // Execute the query with the provided parameters
      await pool.query(query, [user_id, selected_ecole, selected_classe, panier_id, JSON.stringify(furniture_list), total_price]);
  
      // Respond with a success message
      res.status(200).json({ message: 'Order placed successfully!' });
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/get_panier', async (req, res) => {
    try {
      const { user_id } = req.query;
  
      // Construct the SQL query to retrieve user data based on user ID
      const query = `
        SELECT * FROM paniers
        WHERE user_id = $1 
          `; 
  
      // Execute the query with the provided parameters
      const response = await pool.query(query, [user_id]);
      // Check if user data is found
      if (response.rows.length > 0) { 
        // Send the user data as JSON response
        res.json(response.rows);
      } else {
        // If user data is not found, send a 404 status
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
   
  app.delete('/remove_item_from_cart', async (req, res) => {
    try {
      const { user_id, panier_id } = req.query;

      // Construct the SQL query to delete the item from the cart
      const query = `
        DELETE FROM paniers
        WHERE user_id = $1 AND panier_id = $2
      `;
  
      // Execute the query with the provided parameters
      await pool.query(query, [user_id, panier_id]);
   
      // Respond with a success message
      res.status(200).json({ message: 'Item removed from cart successfully!' });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/submit_address', async (req, res) => {
    try {
      const { user_id, address, phone_number } = req.body;
      // Construct the SQL query
      const query = `
        INSERT INTO addresses (user_id, address, phone_number)
        VALUES ($1, $2, $3)
      `; 

      // Execute the query with the provided parameters
      const response = await pool.query(query, [user_id, address, phone_number]);
  
      res.status(200).json({ message: 'Address submitted successfully' });
    } catch (error) {
      console.error('Error submitting address:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/get_address', async (req, res) => {
    try {
      const { userId } = req.query;
  
      // Construct the SQL query
      const query = `
        SELECT * FROM addresses
        WHERE user_id = $1
      `; 
  
      // Execute the query with the provided parameters
      const response = await pool.query(query, [userId]);
  
      // Check if any addresses were found
      if (response.rows.length > 0) {
        res.status(200).json(response.rows);
      } else {
        res.status(404).json({ message: 'No addresses found for the user' });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/place_an_order', async (req, res) => {
    try {
      // Extract the necessary information from the request body
      const { order_id, user_id, panierData } = req.body;
  
      // Construct the SQL query to insert order details into the 'orders' table
      const query = `
        INSERT INTO commandes (order_id, user_id, panierData)
        VALUES ($1, $2, $3)
      `;
  
      // Execute the query with the provided parameters
      await pool.query(query, [order_id, user_id, JSON.stringify(panierData)]);
  
      // Respond with a success message
      res.status(200).json({ message: 'Order submitted successfully!' });
    } catch (error) {
      console.error('Error submitting order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  app.get('/get_orders_by_user', async (req, res) => {
    try {
      const { user_id } = req.query;
  
      // Construct the SQL query to retrieve orders based on user ID
      const query = `
        SELECT * FROM commandes
        WHERE user_id = $1
      `;
  
      // Execute the query with the provided parameters
      const response = await pool.query(query, [user_id]);
  
      // Check if orders are found
      if (response.rows.length > 0) {
        // Send the orders data as JSON response
        res.status(200).json(response.rows);
      } else {
        // If no orders are found, send a 404 status
        res.status(404).json({ error: 'No orders found for the user' });
      }
    } catch (error) {
      console.error('Error fetching orders data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.delete('/delete_panier', async (req, res) => {
    try {
      const { user_id } = req.query;
  
      // Construct the SQL query to delete the user's shopping cart
      const query = `
        DELETE FROM paniers
        WHERE user_id = $1
      `;
  
      // Execute the query with the provided parameters
      await pool.query(query, [user_id]);
  
      // Respond with a success message
      res.status(200).json({ message: 'Shopping cart content deleted successfully!' });
    } catch (error) {
      console.error('Error deleting shopping cart content:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/fournitures_category', async (req, res) => {
    try {
        const response = await pool.query("SELECT distinct categorie_1, categorie_2 FROM fourniture_2");
        res.json(response.rows);}
    catch{
  }});

  app.get('/fournitures_by_category', async (req, res) => {
          try {
            const { category } = req.query;
            const response = await pool.query("SELECT * FROM fourniture_2 WHERE categorie_1 ilike $1", [`%${category}%`]);
            res.json(response.rows);
          } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
  });
 
  app.get('/livre_category', async (req, res) => {
          try {
              const response = await pool.query("SELECT distinct niveau,category_1, category_2 FROM livres");
              res.json(response.rows);}
          catch{
  }});
  
  app.get('/livre_data', async (req, res) => {
                try {

                  const { niveau, category } = req.query;
                  const response = await pool.query("SELECT * FROM livres WHERE niveau = $1 and category_1 = $2 ", [niveau,category]);
                  res.json(response.rows);
                } catch (error) {
                  console.error('Error fetching data:', error);
                  res.status(500).json({ error: 'Internal Server Error' });
                }
  });

  app.get('/produit_fournitures', async (req, res) => {
                try {
                    const query = `
                        SELECT 
                            id,
                            name_to_display,
                            nom, 
                            brand,
                            prix, 
                            available_colors,
                            image, 
                            source,
                            category,
                            subcategory,
                            description 
                        FROM 
                        produits_fournitures;
                    `;
                    const response = await pool.query(query); 
                    res.json(response.rows);
                } catch (error) {
                    console.error("Error:", error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
  });

  app.get('/Fourniture/:product_id', async (req, res) => {
              const { product_id } = req.params;
              try {
                  const query = `
                      SELECT 
                          id,
                          name_to_display,
                          nom, 
                          brand,
                          prix,
                          available_colors,
                          image, 
                          source,
                          category,
                          subcategory,
                          description 
                      FROM 
                      produits_fournitures
                      WHERE 
                      id = $1;
                  `;
                  const values = [product_id];
                  const response = await pool.query(query, values); 
                  
                  if (response.rows.length === 0) {
                    return res.status(404).json({ error: 'Product not found' });
                  }
              
                  res.json(response.rows[0]);
                } catch (error) {
                  console.error("Error:", error);
                  res.status(500).json({ error: 'Internal Server Error' });
                }
  });

  app.get('/Manuelle/:product_id', async (req, res) => {
            const { product_id } = req.params;
            try {
                const query = `
                    SELECT 
                        id,
                        nom,
                        prix,
                        description,
                        information,
                        image,
                        name_to_display
                    FROM 
                    produits_manuelles
                    WHERE 
                    id = $1;
                `;
                const values = [product_id];
                const response = await pool.query(query, values); 
                
                if (response.rows.length === 0) {
                  return res.status(404).json({ error: 'Product not found' });
                }
            
                res.json(response.rows[0]);
              } catch (error) {
                console.error("Error:", error);
                res.status(500).json({ error: 'Internal Server Error' });
              }
  });

  app.get('/produit_manuelles', async (req, res) => {
      try {
          const query = `
              SELECT 
                 *
              FROM 
              produits_manuelles;
          `;
          const response = await pool.query(query); 
          res.json(response.rows);
      } catch (error) {
          console.error("Error:", error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
  });

  app.get('/get_all_products_category', async (req, res) => {
    try {
      const { category } = req.query;
      const response = await pool.query("SELECT * FROM produits_fournitures WHERE category ilike $1 order by prix", [`%${category}%`]);
      res.json(response.rows);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/getting_items_data', async (req, res) => {
    const { item_ids } = req.query;
  
    if (!item_ids) {
      return res.status(400).send('item_ids query parameter is required');
    }
  
    try {
      // Parse the item_ids JSON string to create an array of IDs
      const itemIdsArray = JSON.parse(item_ids);
  
      // Construct the SQL query to fetch the relevant data
      const queryText = `
        SELECT fc2.*, 
               coalesce(pf.name_to_display, pm.name_to_display) AS name, 
               coalesce(pm.prix, pf.prix) AS prix, 
               isbn_numeric, 
               pf.available_colors, 
               coalesce(pf.image, pm.image) AS image, 
               pf.category, 
               final_id, 
               pm.matiere AS manuelle_matiere 
        FROM fourniture_classes_2 fc2 
        LEFT JOIN produits_fournitures pf ON fc2.item_id = pf.id  
        LEFT JOIN produits_manuelles pm ON fc2.item_id = pm.id  
        WHERE fc2.item_id = ANY($1::text[])
        and annee_scolaire = '2024/2025'
        ORDER BY matiere_order, display_order;
      `;
//console.log('Executing query:', queryText, 'with values:', itemIdsArray); // Debug log
  
      // Execute the query
      const result = await pool.query(queryText, [itemIdsArray]);
  
      // Send the result back to the client
      res.json(result.rows);
    } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).send('Internal Server Error');
    }
  });

  app.post('/ajouter_manuel', async (req, res) => {
    const {
      isbn,
      nom,
      editeur,
      prix,
      lien_image,
      ecole,
      classe,
      description,
      lien_source,
    } = req.body;

    const id = 'M-'+ ecole + '-'+ classe + '-'+isbn
    const isbn_test = '"'+ isbn
    const ecole_code = null
    const ecole_classe =  ecole + '-'+ classe
    const matiere = null
    const name_to_display = nom
    console.log('id',id)
    console.log('isbn_test',isbn_test)
    console.log('ecole_code',ecole_code)
    console.log('ecole_classe',ecole_classe)
    console.log('matiere',matiere)
    console.log('name_to_display',name_to_display)

    
    try {
      // Insert data into the produits_manuelles table
      const query = `
        INSERT INTO public.produits_manuelles
        (id, isbn_test, isbn_numeric, ecole_code, ecole, classe, ecole_classe, matiere, nom, prix, description, lien, information, image,  name_to_display, created_at, creator_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11,$12,$13,$14,$15, NOW(), 'youssebaham')
        RETURNING *;
      `;
      const values = [id, isbn_test, isbn, ecole_code, ecole, classe, ecole_classe, matiere, nom, prix, description, lien_source, editeur, lien_image, name_to_display];
      const result = await pool.query(query, values);
  
      res.status(201).json({ message: 'Data inserted successfully', data: result.rows[0] });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ message: 'Error inserting data', error: error.message });
    }
  });


  app.post('/ajouter_produit', async (req, res) => {
    const {
      nom,
      marque,
      prix,
      couleur,
      lienImage,
      lienSource,
      categoryAjouterProduit,
      sousCategoryAjouterProduit,
      description
    } = req.body;

    const uniqueId = uuidv4(); // Generate a unique identifier
    const id = `F-${categoryAjouterProduit}-${uniqueId}`
    const name_to_display = nom
    console.log('id',id)
    console.log('name_to_display',name_to_display)

    
    try {
      // Insert data into the produits_manuelles table
      const query = `
        INSERT INTO public.produits_fournitures
        (id, name_to_display, nom, brand, prix, available_colors, image, source, category, subcategory, description, created_at, creator_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11, NOW(), 'youssefbraham')
        RETURNING *;
      `;
      const values = [
        id,
        name_to_display,
        nom,
        marque,
        prix,
        couleur,
        lienImage,
        lienSource,
        categoryAjouterProduit,
        sousCategoryAjouterProduit,
        description];
      const result = await pool.query(query, values);
  
      res.status(201).json({ message: 'Data inserted successfully', data: result.rows[0] });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ message: 'Error inserting data', error: error.message });
    }
  });

app.listen(4000, () =>{ 
    console.log("server has started on port 4000")
}) 
exports.api = functions.https.onRequest(app) ; 