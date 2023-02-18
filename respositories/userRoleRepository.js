const userRoleRepository = (dbConnection) => {
    const get = async (userRoleId) => {
        if (!userRoleId){
            throw new Error("userRoleId cannot be empty.");
        }

        let sqlQuery = 'SELECT * FROM `UserRole` WHERE `Id` = ?';
        let params = [userRoleId];
    
        return await dbConnection.execute(sqlQuery, params);
    };

    return { get }
};

module.exports = userRoleRepository;