const taskService = (repository, logger) => {
    if (!repository) {
        throw new Error('repository cannot be empty.');
    }

    if (!logger) {
        throw new Error('logger cannot be empty.');
    }

    const list = async (currentUser) => {
        if (!currentUser) {
            throw new Error('currentUser cannot be null.');
        }

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

    const get = async (currentUser, taskCode) => {
        if (!currentUser) {
            throw new Error('currentUser cannot be null.');
        }

        if (!taskCode) {
            throw new Error('taskCode cannot be empty.');
        }

        try {
            let task = await repository.get(taskCode);
            if (!task) {
                logger.warning('task was not found:', taskCode);
                return null;
            }

            if (!currentUser.isManager && task.userId != currentUser.id) {
                logger.warning('retrival task attempt on unauthorized user.', currentUser.id);
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
    
    const create = async (currentUser, task) => {
        if (!currentUser) {
            throw new Error('currentUser cannot be null.');
        }
        
        if (!task) {
            throw new Error('task object cannot be empty.');
        }
    
        try {
            let taskExists = await repository.get(task.code);
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
    const update = async (currentUser, taskCode, task) => {
        if (!currentUser) {
            throw new Error('currentUser cannot be null.');
        }
        
        if (!taskCode) {
            throw new Error('taskCode cannot be empty.');
        }
        
        if (!task) {
            throw new Error('task object cannot be null.');
        }
    
        try {
            let taskToUpdate = await repository.get(taskCode);
            if (!taskToUpdate) { 
                logger.error('task does not exist:', taskCode);
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

            let updated = await repository.update(task.code, task);
            if (!updated) {
                logger.warning('task was not updated:', taskToUpdate.code);
            }

            return updated;
        } catch (error) {
            logger.error('error updating task:', error);
            return false;
        }
    };
    
    const remove = async (currentUser, taskCode) => {
        if (!currentUser) {
            throw new Error('currentUser cannot be null.');
        }
        
        if (!taskCode) {
            throw new Error('taskCode cannot be null.');
        }
    
        try {
            let taskToDelete = await repository.get(taskCode);
            if (!taskToDelete) {
                logger.error('task does not exist:', taskCode);
                return false;
            }

            if (!currentUser.isManager && taskToDelete.userId != currentUser.id) {
                logger.error('attempt to delete other user\' task:', currentUser.id);
                return false;
            }
    
            let removed = await repository.remove(taskCode);
            if (!removed) {
                logger.warning('task was not removed.', taskToDelete.code);
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