const userRepository = (dbConnection) => {
    const getByEmployeeNumber = async (employeeNumber) => {
        if (!employeeNumber) {
            throw new Error("employeeNumber cannot be empty.");
        }

        let sqlQuery = 'SELECT * FROM `User` WHERE `EmployeeNumber` = ?';
        let params = [employeeNumber];
    
        return await dbConnection.execute(sqlQuery, params);
    };

    return { getByEmployeeNumber }
};

module.exports = userRepository;