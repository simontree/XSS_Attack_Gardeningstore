require('dotenv').config();

const mariadb = require('mariadb');

console.log(process.env.DB_HOST)
console.log(process.env.DB_PW)
console.log(process.env.DB_NAME)

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 5
});

// Connect and check for errors
pool.getConnection((err, connection)=>{
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.log('Database connection lost');
        }
        if(err.code === 'ER_CON_COUNT_ERROR'){
            console.log('Database has too many connections');
        }
        if(err.code === 'ECONNREFUSED'){
            console.log('Database connection was refused');
        }
    }
    if(connection) connection.release();

    return;
});

module.exports = pool;