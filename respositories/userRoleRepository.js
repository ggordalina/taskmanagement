const UserRole = require('../models/userRole');

const userRoleRepository = (dbConnection) => {
    if (!dbConnection) {
        throw new Error('dbConnection cannot be empty.');
    }

    const userRoleTableCollumns = [
        'BIN_TO_UUID(Id) AS Id',
        'Description'
    ];
    
    const get = async (id) => {
        if (!id){
            throw new Error('id cannot be empty.');
        }

        let sqlQuery = `SELECT ${userRoleTableCollumns} FROM UserRole WHERE Id = UUID_TO_BIN(?)`;
        let params = [id];
    
        let result = await dbConnection.execute(sqlQuery, params);
        if (result?.length <= 0) {
            return null;
        }

        return UserRole.map(result)[0];
    };

    return { get };
};

module.exports = userRoleRepository;