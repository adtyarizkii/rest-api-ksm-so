var mysql = require('mysql');
var db_config = {
  connectTimeout: 60 * 60 * 10000,
  waitForConnections: 10000,
  connectionLimit: 10000,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true
};

// function handleDisconnect() {
//   connection = mysql.createPool(db_config);
//   connection.getConnection(function (err, connection) {
//     if (err) {
//       connection.release();
//       throw err;
//     }

//     connection.release()
//   })

//   module.exports = connection;
// }

function handleDisconnect() {
  connection = mysql.createPool(db_config);
  connection.getConnection(function (err) {
    if (err) throw err; // not connected!
  });
  // connection.release;
  if (connection) connection.release
  module.exports = connection;

}

handleDisconnect();