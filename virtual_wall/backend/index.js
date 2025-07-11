const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "bizacuity",
  password: "Dhanush@12032006",
  multipleStatements: true,
});

app.listen(8080, () => {
  console.log("server started");
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database");
});

app.post("/SignUp", (req, res) => {
  let { username, password, email } = req.body;
  let q = `INSERT INTO users(username,email,pwd) values(?)`;
  let data = [username, email, password];
  db.query(q, [data], (err) => {
    if (err) {
      return res
        .status(500)
        .send("user already exists enter diff email and username");
    }
    res.status(201).send("registration successful");
  });
});

app.post("/Login", (req, res) => {
  let { username, password } = req.body;
  let q = `select * from users where username=?`;
  db.query(q, [username], (err, result) => {
    if (err || result.length === 0)
      return res.status(500).send("user doesn't exist");
    if (result[0].pwd != password)
      return res.status(500).send("invalid password");
    return res.status(201).json({
      username: result[0].username,
      email: result[0].email,
      id: result[0].id,
    });
  });
});

app.post("/saveDrafts", (req, res) => {
  let { uid, wall_data, timestamp, wall_name, wall_id } = req.body;
  if (wall_id) {
    // Update existing draft
    let q = `UPDATE walls SET wall_data=?, timestamp=?, wall_name=? WHERE wall_id=? AND uid=?`;
    let data = [wall_data, timestamp, wall_name, wall_id, uid];
    db.query(q, data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("cannot update the draft");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("Draft not found or not owned by user");
      }
      return res.status(200).send("draft updated");
    });
  } else {
    // Insert new draft
    let q = `INSERT INTO walls(wall_data, timestamp, uid, wall_name) values(?,?,?,?)`;
    let data = [wall_data, timestamp, uid, wall_name];
    db.query(q, data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("cannot save the draft");
      }
      return res.status(201).send("draft saved");
    });
  }
});

app.get("/getDrafts/:id", (req, res) => {
  const uid = req.params.id;
  let q = `SELECT * FROM walls WHERE uid = ?`;
  db.query(q, [uid], (err, results) => {
    if (err) return res.status(500).send("Error fetching drafts");
    return res.status(200).json(results);
  });
});

app.delete("/deleteDraft/:id",(req,res)=>{
  const wall_id=req.params.id;
  let q=`DELETE FROM walls WHERE wall_id=?`;
  db.query(q,[wall_id],(err,result)=>{
    if(err)
      return res.status(500).send("error in deleting draft");

    if (result.affectedRows === 0) 
      return res.status(404).send("Draft not found");
    return res.status(201).send("deleted draft successfully");
  })
})