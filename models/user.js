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

    static map(dbUserObjectArray) {
        return dbUserObjectArray.map((obj) =>
            new User(obj.Id, obj.EmployeeNumber, obj.Name, obj.UserRoleId));
    }
}

module.exports = User;