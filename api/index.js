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
    console.log("erreur");}}); 

app.get('/fournitures', async (req, res) => {
        try {
            const response = await pool.query("SELECT * FROM fournitures");
            res.json(response.rows);}
        catch{
            console.log("erreur");}});

app.post('/creation_liste', async (req, res) => {
    try {
        const { ecole, classe, matiere, selectedItems } = req.body;

        // Construct the SQL query
        const query = `
            INSERT INTO fourniture_classes (nom_ecole, nom_classe, nom_matiere, fourniture_list)
            VALUES ($1, $2, $3, $4)  
        `; 
 
        // Execute the query with the provided parameters
        const response = await pool.query(query, [ecole, classe, matiere, selectedItems]);


        res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error inserting data:', error);
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
    
  app.post('/ajouter_panier', async (req, res) => {
    try {
      // Extract the necessary information from the request body
      const { user_id, selectedEcole, selectedClasse, order_id, furnitureList, total_price } = req.body;
  
      // Construct the SQL query to insert order details into the 'orders' table
      const query = `
        INSERT INTO commandes (user_id, selected_ecole, selected_classe, order_id, furniture_list, total_price)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
  
      // Execute the query with the provided parameters
      await pool.query(query, [user_id, selectedEcole, selectedClasse, order_id, JSON.stringify(furnitureList), total_price]);
  
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
        SELECT * FROM commandes
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
   

app.listen(4000, () =>{
    console.log("server has started on port 4000")
}) 
exports.api = functions.https.onRequest(app); 
 