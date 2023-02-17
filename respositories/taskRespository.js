const connection = require('../database/connection');

const list = async () => {
    let sqlQuery = 'SELECT * FROM `Task`';
    return await connection.execute(sqlQuery);
};

const listByUserId = async (userId) => {
    let sqlQuery = 'SELECT * FROM `Task` WHERE `UserId` = ?';
    let params = [userId];

    return await connection.execute(sqlQuery, params);
}

const get = async (taskCode) => {
    if (!taskCode) {
        throw new Error("taskCode cannot be empty.");
    }

    let sqlQuery = 'SELECT * FROM `Task` WHERE `Code` = ?';
    let params = [taskCode];

    return await connection.execute(sqlQuery, params);
};

const create = async (task) => {
    if (!task) {
        throw new Error("task object cannot be empty.");
    }

    let sqlQuery = 'INSERT INTO `Task` (`Code`, `Summary`, `HasSensitiveData`, `UserId`) '; 
    sqlQuery += 'VALUES (?, ?, ?, ?)';
    let params = [task.code, task.summary, task.hasSensitiveData, task.UserId]; // TODO

    let result = await connection.execute(sqlQuery, params);
    return result?.lenght > 0;
};

const update = async (taskCode, task) => {
    if (!taskCode) {
        throw new Error("task code cannot be empty.");
    }

    if (!task) {
        throw new Error("task object cannot be empty.");
    }

    let sqlQuery = 'UPDATE `Task` ';
    sqlQuery += 'SET `Summary` = ?, `HasSensitiveData` = ? ';
    sqlQuery += 'WHERE `Code` = ?';
    let params = [task.summary, task.hasSensitiveData, task.code]; // TODO

    let result = await connection.execute(sqlQuery, params);
    return result?.lenght > 0;
};

const remove = async (taskCode) => {
    if (!taskCode) {
        throw new Error("taskCode cannot be empty.");
    }

    let sqlQuery = 'DELET FROM `Task` WHERE `Code` = ?';
    let params = [taskCode];

    let result = await connection.execute(sqlQuery, params);
    return result?.lenght > 0;
};

module.exports = { list, listByUserId, get, create, update, remove };