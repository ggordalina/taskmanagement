const userService = (userRepository, userRoleRepository, logger) => {
    if (!userRepository) {
        throw new Error('userRepository cannot be empty.');
    }

    if (!userRoleRepository) {
        throw new Error('userRoleRepository cannot be empty.');
    }

    if (!logger) {
        throw new Error('logger cannot be empty.');
    }

    const get = async (employeeNumber) => {
        if (!employeeNumber) {
            throw new Error('employeeNumber cannot be empty.');
        }

        try {
            let user = await userRepository.getByEmployeeNumber(employeeNumber);
            if (!user) {
                logger.error('user does not exist:', employeeNumber);
                return null;
            }

            let userRole = await userRoleRepository.get(user.userRoleId);
            if (!userRole) {
                logger.error(`unable to identify user's ${employeeNumber} role:`, user.userRoleId);
                return null;
            }

            user.setRole(userRole);
            return user;
        } catch (error) {
            logger.error('error retrieving user:', error);
            return null;
        }
    };

    return { get }
};

module.exports = userService;