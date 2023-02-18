const taskService = (repository, logger, currentUser) => {
    if (!repository) {
        throw new Error('repository cannot be empty.');
    }

    if (!logger) {
        throw new Error('logger cannot be empty.');
    }

    if (!currentUser) {
        throw new Error('currentUser cannot be empty.');
    }

    const list = async () => {
        try {
            return currentUser.isManager
                ? await repository.list()
                : await repository.listByUserId(currentUser.id);
        }
        catch (error) {
            logger.error('error retrieving tasks:', error);
            return [];
        }
    }

    const get = async (taskCode) => {
        if (!taskCode) {
            throw new Error('taskCode cannot be empty.');
        }

        try {
            let result = await repository.get(taskCode);
            if (result?.length <= 0) {
                return null;
            }

            let task = result[0];
            if (!currentUser.isManager && task.userId != currentUser.id) {
                logger.warning('retrival task attempt on authorized user.', currentUser.id);
                return null;
            }
            
            if (task.hasSensitiveData) {
                task.obfuscateSensitiveData();
            }

            return task;
        } catch (error) {
            logger.error('error retrieving task:', error);
            return null;
        }
    };
    
    const create = async (task) => {
        if (!task) {
            throw new Error('task object cannot be empty.');
        }
    
        try {
            let taskExists = (await repository.get(task.code))?.length > 0;
            if (taskExists) {
                logger.error('task.code must be unique.');
                return null;
            }
    
            task.userId = currentUser.id;
            task.closedDate = null;
    
            let created = await repository.create(task);
            if (!created) {
                logger.warning('task was not created.');
                return null;
            }
    
            return task;
        } catch (error) {
            logger.error('error saving task:', error);
            return null;
        }
    };
    
    // TODO: possible issue: cannot diferenciate between task does not exist and general update error
    const update = async (task) => {
        if (!task) {
            throw new Error('task object cannot be null.');
        }
    
        try {
            let taskToUpdate = (await repository.get(task.code))?.[0];
            if (!taskToUpdate) { 
                logger.error('task does not exist.');
                return false;
            }

            if (taskToUpdate.userId != currentUser.id) {
                logger.error('attempt to update other user\' task:', currentUser.id);
                return false;
            }
    
            if (taskToUpdate.isClosed()) {
                logger.error('a closed task cannot be updated:', taskToUpdate.code);
                return false
            }

            let updated = (await repository.update(task.code, task)).length > 0;
            if (!updated) {
                logger.warning('task was not updated.');
            }

            return updated;
        } catch (error) {
            logger.error('error updating task:', error);
            return false;
        }
    };
    
    const remove = async (taskCode) => {
        if (!taskCode) {
            throw new Error('taskCode cannot be null');
        }
    
        try {
            let taskToDelete = (await repository.get(taskCode))?.[0];
            if (!taskToDelete) {
                logger.error('task does not exist.');
                return false;
            }

            if (!currentUser.isManager && taskToDelete.userId != currentUser.id) {
                logger.error('attempt to delete other user\' task:', currentUser.id);
                return false;
            }
    
            let removed = (await repository.remove(taskCode)).length > 0;
            if (!removed) {
                logger.warning('task was not removed.');
            }

            return removed;
        } catch (error) {
            logger.error('error removing task:', error);
            return false;
        }
    };

    return { list, get, create, update, remove };
};

module.exports = taskService;