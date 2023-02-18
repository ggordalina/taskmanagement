class User {
    constructor (id, employeeId, name, userRoleId) {
        this.id = id;
        this.employeeId = employeeId;
        this.name = name;
        this.userRoleId = userRoleId;
        this.isManager = false;
    }

    setIsManager(userRole) {
        this.isManager = userRole.description == 'Manager';
    }
}

module.exports = User;