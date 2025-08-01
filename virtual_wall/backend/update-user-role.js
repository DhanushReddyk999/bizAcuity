const db = require('./db');

function updateUserToAdmin() {
  const username = 'Sunny'; // The username you want to make admin
  
  console.log(`Updating user '${username}' to admin role...`);
  
  db.query("UPDATE users SET role = 'admin' WHERE username = ?", [username], (err, result) => {
    if (err) {
      console.error("Error updating user role:", err);
      return;
    }
    
    if (result.affectedRows === 0) {
      console.log(`User '${username}' not found in database`);
      return;
    }
    
    console.log(`Successfully updated user '${username}' to admin role!`);
    console.log("You can now log in with this user and access admin features.");
    process.exit(0);
  });
}

updateUserToAdmin(); 