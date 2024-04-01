const functions = require('firebase-functions');
const express = require("express");
const app = express();
const cors = require("cors")
const  pool = require('./db');

app.use(cors({
  origin: ['https://founitures-6f03c.web.app','http://localhost:5173'],
  credentials: true, 
}));

app.use(express.json())  
  
app.get('/ecoles', async (req, res) => {
try {
    const response = await pool.query("SELECT * FROM ecoles");
    res.json(response.rows);}
catch{
    console.log("erreur_ecole");}}); 
 
app.get('/fournitures', async (req, res) => {
        try {
            const response = await pool.query("SELECT * FROM fournitures");
            res.json(response.rows);}
        catch{
            console.log("erreur_fournitures");}});

app.get('/fournitures_by_selection', async (req, res) => {
              try {
                const { ecole, classe, matiere } = req.query;
                const response = await pool.query("SELECT * FROM fourniture_classes WHERE nom_ecole = $1 AND nom_classe = $2 AND nom_matiere = $3", [ecole, classe, matiere]);
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


app.get('/all_fourniture_classe', async (req, res) => {
    try {
      const { ecole, classe } = req.query;
      const response = await pool.query("SELECT * FROM fourniture_classes WHERE nom_ecole = $1 AND nom_classe = $2", [ecole, classe]);
      res.json(response.rows); 
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/lien_liste', async (req, res) => {
    try {
      const { ecole, classe } = req.query;
      const response = await pool.query("SELECT * FROM lien_liste WHERE nom_ecole = $1 AND classe = $2", [ecole, classe]);
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
        console.log("erreur_fournitures_category");}});

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
              console.log("erreur_livre_category");}});
  

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
                            name, 
                            brand,
                            price,
                            available_colors,
                            product_picture, 
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
      const response = await pool.query("SELECT * FROM fourniture_2 WHERE categorie_1 ilike $1", [`%${category}%`]);
      res.json(response.rows);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

app.listen(4000, () =>{ 
    console.log("server has started on port 4000")
}) 
exports.api = functions.https.onRequest(app) ; 