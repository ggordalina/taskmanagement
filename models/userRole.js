class UserRole {
    constructor (id, description) {
        this.id = id;
        this.description = description;
    }

    static map(dbUserRoleObjectArray) {
        return dbUserRoleObjectArray.map((obj) => 
            new UserRole(obj.Id, obj.Description));
    }
}

module.exports = UserRole;