const User = require('../models/user');

const userRepository = (dbConnection) => {
    if (!dbConnection) {
        throw new Error('dbConnection cannot be empty.');
    }

    const userTableCollumns = [
        'BIN_TO_UUID(Id) AS Id',
        'EmployeeNumber', 
        'Name',
        'BIN_TO_UUID(UserRoleId) AS UserRoleId'
    ];
    
    const getByEmployeeNumber = async (employeeNumber) => {
        if (!employeeNumber) {
            throw new Error("employeeNumber cannot be empty.");
        }

        let sqlQuery = `SELECT ${userTableCollumns.join(', ')} FROM User WHERE EmployeeNumber = ?`;
        let params = [employeeNumber];
    
        let result = await dbConnection.execute(sqlQuery, params);
        if (result.length <= 0) {
            return null;
        }

        return User.map(result)[0];
    };

    return { getByEmployeeNumber };
};

module.exports = userRepository;