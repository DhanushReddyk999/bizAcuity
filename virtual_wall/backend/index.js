const express=require("express");
const cors=require("cors");
const mysql=require("mysql2");

const app=express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'bizacuity',
  password:'Dhanush@12032006',
  multipleStatements :true
});

app.listen(8080,()=>{
    console.log("server started");
})

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database');
});

app.post("/SignUp",(req,res)=>{
  let {username,password,email}=req.body;
  let q=`INSERT INTO users(username,email,pwd) values(?)`
  let data=[username,email,password]
  db.query(q,[data],(err)=>{
    if(err)
      return res.status(500).send("user already exists enter diff email and username");
    res.status(201).send("registration successful");
    })
})

app.post("/Login",(req,res)=>{
  let {username,password}=req.body;
  let q=`select * from users where username=?`;
  db.query(q,[username],(err,result)=>{
    if(err||result.length===0)
      return res.status(500).send("user doesn't exist");
    if(result[0].pwd!=password)
      return res.status(500).send("invalid password");
    return res.status(201).json({username:result[0].username,email:result[0].email,message:"login successful"});
  })
})