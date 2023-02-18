class User {
    constructor (id, employeeNumber, name, userRoleId) {
        this.id = id;
        this.employeeNumber = employeeNumber;
        this.name = name;
        this.userRoleId = userRoleId;
        this.isManager = false;
        this.userRole = null;
    }

    setRole(userRole) {
        this.userRole = userRole;
        this.isManager = userRole.description == 'Manager'
    }
}

module.exports = User;