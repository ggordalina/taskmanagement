const get = async (repository, currentUser, taskCode = null) => {
    try {
        if (!taskCode) {
            return currentUser.isManager
                ? await repository.list()
                : await repository.listByUserId(currentUser.id);
        } else {
            let result = await repository.get(taskCode);
            if (!result || result.lenght != 1){
                return null;
            }

            let task = result[0];
            let taskBelongsToUser = task.userId == currentUser.id;
            
            if (!currentUser.isManager && !taskBelongsToUser) {
                return null;
            }
            
            if (task.hasSensitiveData) {
                task.obfuscateSensitiveData();
            }

            return task;
        }
    } catch (error) {
        console.error("error retriving task:", error);
        return [];
    }
};

const create = async (repository, currentUser, task) => {
    if (!task) {
        throw new Error("task object cannot be null");
    }

    try {
        let taskExists = (await repository.get(taskCode))?.lenght > 0;
        if (taskExists){
            throw new Error("task.code must be unique.");
        }

        task.userId = currentUser.id;
        task.closedDate = null;

        let created = await repository.create(task);
        if (!created) {
            throw new Error("task was not saved.");
        }

        return task;
    } catch (error) {
        console.error("error saving task:", error);
        return null;
    }
};

const update = async (repository, task) => {
    if (!task) {
        throw new Error("task object cannot be null");
    }

    try {
        let taskToUpdate = await get(repository, currentUser, task.code);
        if (!taskToUpdate) {
            throw new Error("task does not exist.");
        }

        if (taskToUpdate.isClosed()) {
            throw new Error("cannot update already closed task.");
        }

        return await repository.update(task.code, task);
    } catch (error) {
        console.error("error updating task:", error);
        return false;
    }
};

const remove = async (repository, taskCode) => {
    if (!taskCode) {
        throw new Error("taskCode cannot be null");
    }

    try {
        let taskToDelete = await get(repository, currentUser, taskCode);
        if (!taskToDelete) {
            throw new Error("task does not exist.");
        }

        return await repository.remove(task.code);
    } catch (error) {
        console.error("error removing task:", error);
        return false;
    }
};

export { get, create, update, remove }