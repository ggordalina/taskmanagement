'use strict';

const mysql = require('mysql2');
const fs = require('fs');

let host, port, user, password;

const execute = (sqlFile) => {
    const connection = mysql.createConnection({
        host: host,
        port: port,
        user: user,
        password: password,
        multipleStatements: true
    });

    console.log("Running Migration.");
    connection.query(sqlFile, (error, _) => {
        if (error) throw error;
    });

    connection.end((error) => {
        if (error) throw error;
        console.log("Migration Finished.");
    });
}

if (process.env.DATABASE_HOST == undefined) throw new Error("missing DATABASE_HOST environment variable");
if (process.env.DATABASE_PORT == undefined) throw new Error("missing DATABASE_PORT environment variable");
if (process.env.DATABASE_USER == undefined) throw new Error("missing DATABASE_USER environment variable");
if (process.env.DATABASE_PASSWORD == undefined) throw new Error("missing DATABASE_PASSWORD environment variable");

host = process.env.DATABASE_HOST;
port = process.env.DATABASE_PORT;
user = process.env.DATABASE_USER;
password = process.env.DATABASE_PASSWORD;

fs.readFile(`${__dirname}/swordHealthChallengeSchema.sql`, 'utf-8', (error, data) => {
    if (error) throw error;
    execute(data);
});