const { AppError, ApplicationExceptions } = require("../utils/applicationExceptions");

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
            let tasks = await currentUser.isManager
                ? await repository.list()
                : await repository.listByUserId(currentUser.id);

            if (tasks.some((elem) => elem.userId != currentUser.id)) {
                tasks = tasks.map((task) => {
                    if (task.hasSensitiveData) {
                        task.obfuscateSensitiveData();
                    }

                    return task;
                });
            }

            return [null, tasks];
        }
        catch (error) {
            logger.error('error retrieving tasks:', error);
            return [new AppError(ApplicationExceptions.DataAccess, 'error retrieving tasks'), null];
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
            let task = await repository.getByCode(taskCode);
            if (!task) {
                logger.warning('task was not found:', taskCode);
                return [new AppError(ApplicationExceptions.TaskNotFound, 'task was not found'), null];
            }

            if (!currentUser.isManager && task.userId != currentUser.id) {
                logger.warning('retrival task attempt on unauthorized user.', currentUser.id);
                return [new AppError(ApplicationExceptions.TaskNotFound, 'task was not found'), null];
            }
            
            if (task.userId != currentUser.id && task.hasSensitiveData) {
                task.obfuscateSensitiveData();
            }

            return [null, task];
        } catch (error) {
            logger.error('error retrieving task:', error);
            return [new AppError(ApplicationExceptions.DataAccess, 'error retrieving task'), null];
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
            let taskExists = await repository.getByCode(task.code);
            if (taskExists) {
                logger.error('task.code must be unique.');
                return [new AppError(ApplicationExceptions.TaskAlreadyExists, 'task.code must be unique'), null];
            }
    
            task.userId = currentUser.id;
            task.closedDate = null;
            
            let created = await repository.create(task);
            if (!created) {
                logger.warning('task was not created.');
                return [new AppError(ApplicationExceptions.DataAccess, 'task was not created'), null];
            }
    
            return [null, task];
        } catch (error) {
            logger.error('error saving task:', error);
            return [new AppError(ApplicationExceptions.DataAccess, 'error saving task'), null];
        }
    };
    
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
            let taskToUpdate = await repository.getByCode(taskCode);
            if (!taskToUpdate) { 
                logger.error('task does not exist:', taskCode);
                return [new AppError(ApplicationExceptions.TaskNotFound, 'task does not exist'), null];
            }

            if (taskToUpdate.userId != currentUser.id) {
                logger.error('attempt to update other user\' task:', currentUser.id);
                return [new AppError(ApplicationExceptions.TaskNotFound, 'task does not exist'), null];
            }
    
            if (taskToUpdate.isClosed()) {
                logger.error('a closed task cannot be updated:', taskToUpdate.code);
                return [new AppError(ApplicationExceptions.TaskAlreadyExists, 'a closed task cannot be updated'), null];
            }

            // Copies the property value of the current task to the updated the task only if
            // the input did not have explicitly the property. This allows to input null values if
            // the user choses.
            const nonUpdatableProperties = ['id', 'code'];
            for (const prop in taskToUpdate) {
                if (!nonUpdatableProperties.some(elem => elem == prop) && !Object.hasOwn(task, prop)) {
                    task[prop] = taskToUpdate[prop];
                }
            }

            let updated = await repository.update(taskCode, task);
            if (!updated) {
                logger.warning('task was not updated:', taskToUpdate.code);
                return [new AppError(ApplicationExceptions.DataAccess, 'task was not updated'), null];
            }

            return [null, updated];
        } catch (error) {
            logger.error('error updating task:', error);
            return [new AppError(ApplicationExceptions.DataAccess, 'error updating task'), null];
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
            let taskToDelete = await repository.getByCode(taskCode);
            if (!taskToDelete) {
                logger.error('task does not exist:', taskCode);
                return [new AppError(ApplicationExceptions.TaskNotFound, 'task does not exist'), null];
            }

            if (!currentUser.isManager && taskToDelete.userId != currentUser.id) {
                logger.error('attempt to delete other user\' task:', currentUser.id);
                return [new AppError(ApplicationExceptions.TaskNotFound, 'task does not exist'), null];
            }
    
            let removed = await repository.remove(taskCode);
            if (!removed) {
                logger.warning('task was not removed.', taskToDelete.code);
                return [new AppError(ApplicationExceptions.DataAccess, 'task was not removed'), null];
            }

            return [null, removed];
        } catch (error) {
            logger.error('error removing task:', error);
            return [new AppError(ApplicationExceptions.DataAccess, 'error updating task'), null];
        }
    };

    return { list, get, create, update, remove };
};

module.exports = taskService;