const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: 'sword_health_challenge'
});

const execute = async (sqlQuery, params = null) => {
    try {
        const [rows] = await pool.promise().execute(sqlQuery, params);
        return rows;
    }
    catch (error) {
        console.error("database execution error:", error);
        return [];
    }
};

module.exports = { execute };