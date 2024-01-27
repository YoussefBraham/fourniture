const express = require("express");
const app = express();
const cors = require("cors")
const  pool = require('./db');

app.use(cors()) 
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
   
    console.log(ecole) 
    console.log(classe)

      const response = await pool.query("SELECT * FROM fourniture_classes WHERE nom_ecole = $1 AND nom_classe = $2", [ecole, classe]);
      
      res.json(response.rows);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }); 

app.listen(4000, () =>{
    console.log("server has started on port 4000")
}) 

