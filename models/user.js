class User {
    constructor (id, employeeId, name, userRoleId) {
        this.id = id;
        this.employeeId = employeeId;
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