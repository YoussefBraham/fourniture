const express = require("express");
const app = express();
const cors = require("cors")
const  pool = require('./db');


app.use(cors()) 
app.use(express.json())

app.get('/test', async (req, res) => {
try {

    const testresponse = await pool.query("SELECT * FROM test3");
    res.json(testresponse.rows);
}
catch{
    console.log("erreur");
}
});


app.listen(4000, () =>{
    console.log("server has started on port 4000")
}) 