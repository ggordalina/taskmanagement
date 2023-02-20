const Task = require('../models/task');

const taskRespository = (dbConnection) => {
    if (!dbConnection) {
        throw new Error('dbConnection cannot be empty.');
    }

    const taskTableCollumns = [
        'Code',
        'Summary', 
        'HasSensitiveData',
        'ClosedDate',
        'BIN_TO_UUID(UserId) AS UserId'
    ];

    const list = async () => {
        let sqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task`;
        
        let result = await dbConnection.execute(sqlQuery);
        if (result.length <= 0) {
            return [];
        }

        return Task.map(result);
    };
    
    const listByUserId = async (userId) => {
        if (!userId) {
            throw new Error('userId cannot be empty.');
        }

        let sqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task WHERE UserId = UUID_TO_BIN(?)`;
        let params = [userId];
    
        let result = await dbConnection.execute(sqlQuery, params);
        if (result.length <= 0) {
            return [];
        }

        return Task.map(result);
    };
    
    const getByCode = async (taskCode) => {
        if (!taskCode) {
            throw new Error('taskCode cannot be empty.');
        }
    
        let sqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task WHERE Code = ?`;
        let params = [taskCode];
    
        let result = await dbConnection.execute(sqlQuery, params);
        if (result.length <= 0) {
            return null;
        }

        return Task.map(result)[0];
    };
    
    const create = async (task) => {
        if (!task) {
            throw new Error('task object cannot be empty.');
        }
    
        let sqlQuery = 'INSERT INTO Task (Code, Summary, HasSensitiveData, UserId) '; 
        sqlQuery += 'VALUES (?, ?, ?, UUID_TO_BIN(?))';
        let params = [task.code, task.summary || null, task.hasSensitiveData | 0, task.userId];
    
        let result = await dbConnection.execute(sqlQuery, params);
        return result?.affectedRows > 0;
    };
    
    const update = async (taskCode, task) => {
        if (!taskCode) {
            throw new Error('task code cannot be empty.');
        }
    
        if (!task) {
            throw new Error('task object cannot be empty.');
        }
    
        let sqlQuery = 'UPDATE Task ';
        sqlQuery += 'SET Summary = ?, HasSensitiveData = ?, ClosedDate = ? ';
        sqlQuery += 'WHERE Code = ?';
        let params = [task.summary || null, task.hasSensitiveData | 0, task.closedDate || null, taskCode];

        let result = await dbConnection.execute(sqlQuery, params);
        return result?.affectedRows > 0;
    };
    
    const remove = async (taskCode) => {
        if (!taskCode) {
            throw new Error('taskCode cannot be empty.');
        }
    
        let sqlQuery = 'DELETE FROM Task WHERE Code = ?';
        let params = [taskCode];
    
        let result = await dbConnection.execute(sqlQuery, params);
        return result?.affectedRows > 0;
    };

    return { list, listByUserId, getByCode, create, update, remove };
};

module.exports = taskRespository;