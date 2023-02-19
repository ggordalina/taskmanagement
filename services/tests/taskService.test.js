const taskRepositoryMock = jest.createMockFromModule('../../respositories/taskRespository');
const loggerMock = jest.createMockFromModule('../../logger/logger');
const taskService = require('../taskService');
const User = require('../../models/user');
const UserRole = require('../../models/userRole');
const Task = require('../../models/task');

const userNotManager = new User('341', '9988', 'Clive', '0987');
const userManager = new User('1234', '12312', 'James', '1234');
userManager.setRole(new UserRole('123', 'Manager'));
const defaultTask = new Task('pid-7788', 'simple', false, null, userNotManager.id);

getService = () => taskService(taskRepositoryMock, loggerMock);
getClonedTask = () => new Task(
    defaultTask.code,
    defaultTask.summary,
    defaultTask.hasSensitiveData,
    defaultTask.closedDate,
    defaultTask.userId
);

beforeEach(() => {
    loggerMock.info = jest.fn(() => { });
    loggerMock.warning = jest.fn(() => { });
    loggerMock.error = jest.fn(() => { });

    taskRepositoryMock.list = jest.fn(() => { });
    taskRepositoryMock.listByUserId = jest.fn(() => { });
    taskRepositoryMock.getByCode = jest.fn(() => { });
    taskRepositoryMock.create = jest.fn(() => { });
    taskRepositoryMock.update = jest.fn(() => { });
    taskRepositoryMock.remove = jest.fn(() => { });
});

describe('parameters', () => {
    test.each([
        null, 
        undefined
    ])('repository is invalid and throws error', (repository) => {
        // arrange
        const expectError = new Error('repository cannot be empty.');
        
        // act
        let func = () => taskService(repository, loggerMock, userManager);

        // act & assert
        expect(func).toThrow(expectError);
    });

    test.each([
        null, 
        undefined
    ])('logger is invalid and throws error', (logger) => {
        // arrange
        const expectError = new Error('logger cannot be empty.');
        
        // act
        let func = () => taskService(taskRepositoryMock, logger, userManager);

        // act & assert
        expect(func).toThrow(expectError);
    });
});

describe('list', () => {
    test.each([
        null,
        undefined
    ])('current user is invalid and throws error', async (currentUser) => {
        // arrange
        const expectedError = new Error('currentUser cannot be null.');

        // act & assert
        await expect(getService().list(currentUser)).rejects.toEqual(expectedError);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(0);
    });

    describe('user is manager', () => {
        test('repository throws error and returns empty array', async () => {
            // arrange 
            const expectedErrorMessage = 'error retrieving tasks:';
            const expectedError = new Error('error in repo.');
            taskRepositoryMock.list = jest.fn().mockRejectedValue(expectedError);

            // act
            let result = await getService().list(userManager);

            // assert
            expect(result).toHaveLength(0);
            expect(taskRepositoryMock.list.mock.calls).toHaveLength(1);
            expect(loggerMock.error.mock.calls).toHaveLength(1);
            expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
            expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        });

        test('repository returns content and returns its content', async () => {
            // arrange 
            taskRepositoryMock.list = jest.fn(() => [defaultTask]);

            // act
            let result = await getService().list(userManager);

            // assert
            expect(result).toEqual([defaultTask]);
            expect(taskRepositoryMock.list.mock.calls).toHaveLength(1);
            expect(loggerMock.error.mock.calls).toHaveLength(0);
        });
    });

    describe('user is not manager', () => {
        test('repository throws error and returns empty array', async () => {
            // arrange 
            const expectedErrorMessage = 'error retrieving tasks:';
            const expectedError = new Error('error in repo.');
            taskRepositoryMock.listByUserId = jest.fn().mockRejectedValue(expectedError);

            // act
            let result = await getService().list(userNotManager);

            // assert
            expect(result).toEqual([]);
            expect(taskRepositoryMock.listByUserId.mock.calls).toHaveLength(1);
            expect(taskRepositoryMock.listByUserId.mock.calls[0][0]).toBe(userNotManager.id);
            expect(loggerMock.error.mock.calls).toHaveLength(1);
            expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
            expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        });

        test('repository returns content and returns its content', async () => {
            // arrange 
            taskRepositoryMock.listByUserId = jest.fn(() => [defaultTask]);

            // act
            let result = await getService().list(userNotManager);

            // assert
            expect(result).toEqual([defaultTask]);
            expect(taskRepositoryMock.listByUserId.mock.calls).toHaveLength(1);
            expect(taskRepositoryMock.listByUserId.mock.calls[0][0]).toBe(userNotManager.id);
            expect(loggerMock.error.mock.calls).toHaveLength(0);
        });
    });
});

describe('get', () => {
    test.each([
        null,
        undefined
    ])('current user is invalid and throws error', async (currentUser) => {
        // arrange
        const expectedError = new Error('currentUser cannot be null.');

        // act & assert
        await expect(getService().get(currentUser, defaultTask.code)).rejects.toEqual(expectedError);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(0);
    });

    test.each([
        null,
        undefined
    ])('task code is invalid and throws error', async (taskCode) => {
        // arrange
        const expectedError = new Error('taskCode cannot be empty.');

        // act & assert
        await expect(getService().get(userNotManager, taskCode)).rejects.toEqual(expectedError);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(0);
    });

    test('repository throws error and returns null', async () => {
        // arrange
        const expectedErrorMessage = 'error retrieving task:';
        const expectedError = new Error('error in repo.');
        taskRepositoryMock.getByCode = jest.fn().mockRejectedValue(expectedError);

        // act
        let result = await getService().get(userNotManager, defaultTask.code);

        // assert
        expect(result).toBeNull();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
    });

    test('repository returns empty result and returns null', async () => {
        // arrange
        const expectedErrorMessage = 'task was not found:';
        taskRepositoryMock.getByCode = jest.fn(() => null);

        // act
        let result = await getService().get(userManager, defaultTask.code);

        // assert
        expect(result).toBeNull();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(1);
        expect(loggerMock.warning.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.warning.mock.calls[0][1]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });

    test('user is manager and task does not belong to user and returns task', async () => {
        // arrage
        let task = getClonedTask();
        taskRepositoryMock.getByCode = jest.fn(() => task);

        // act
        let result = await getService().get(userManager, task.code);

        // assert
        expect(result).toEqual(task);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(task.code);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
    });

    test('task does not belong to user and returns null', async () => {
        // arrange
        const expectedResult = getClonedTask();
        expectedResult.userId = '4444';
        const expectedWarningMessage = 'retrival task attempt on unauthorized user.';
        taskRepositoryMock.getByCode = jest.fn(() => [expectedResult]);

        // act
        let result = await getService().get(userNotManager, expectedResult.code);

        // assert
        expect(result).toBeNull();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(expectedResult.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(1);
        expect(loggerMock.warning.mock.calls[0][0]).toBe(expectedWarningMessage);
        expect(loggerMock.warning.mock.calls[0][1]).toBe(userNotManager.id);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });

    test('task has sensitive date and its summary gets obfuscated', async () => {
        // arrange
        const expectedObfuscatedMessage = 'This content cannot be diplayed because it contains sensitive data.';
        const expectedResult = getClonedTask();
        expectedResult.hasSensitiveData = true;
        expectedResult.summary = expectedObfuscatedMessage;
        taskRepositoryMock.getByCode = jest.fn(() => expectedResult);

        // act
        let result = await getService().get(userManager, expectedResult.code);

        // assert
        expect(result).toEqual(expectedResult);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(expectedResult.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });

    test('returns valid task', async () => {
        // arrange
        const task = getClonedTask();
        taskRepositoryMock.getByCode = jest.fn(() => task);

        // act
        let result = await getService().get(userManager, task.code);

        // assert
        expect(result).toEqual(task);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(task.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });
});

describe('create', () => {
    test.each([
        null,
        undefined
    ])('current user is invalid and throws error', async (currentUser) => {
        // arrange
        const expectedError = new Error('currentUser cannot be null.');

        // act & assert
        await expect(getService().create(currentUser, defaultTask)).rejects.toEqual(expectedError);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.create.mock.calls).toHaveLength(0);
    })

    test.each([
        null,
        undefined
    ])('task object is invalid and throws error', async (task) => {
        // arrange
        const expectedError = new Error('task object cannot be empty.');

        // act & assert
        await expect(getService().create(userNotManager, task)).rejects.toEqual(expectedError);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.create.mock.calls).toHaveLength(0);
    });

    test('repository throws error and returns null', async () => {
        // arrange
        const expectedErrorMessage = 'error saving task:';
        const expectedError = new Error('error in repo.');
        taskRepositoryMock.getByCode = jest.fn().mockRejectedValue(expectedError);

        // act
        let result = await getService().create(userNotManager, defaultTask);

        // assert
        expect(result).toBeNull();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
    });

    test('task already exists and throws error', async () => {
        // arrange
        const expectedErrorMessage = 'task.code must be unique.';
        taskRepositoryMock.getByCode = jest.fn(() => [defaultTask]);

        let result = await getService().create(userNotManager, defaultTask);

        // assert 
        expect(result).toBeNull();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(taskRepositoryMock.create.mock.calls).toHaveLength(0);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
    });

    test('task was not created and returns null', async () => {
        // arrange
        const task = getClonedTask();
        task.userId = null;
        const expectedTaskToCreate = getClonedTask();
        expectedTaskToCreate.closedDate = null;
        const expectedWarningMessage = 'task was not created.';
        taskRepositoryMock.getByCode = jest.fn(() => null);
        taskRepositoryMock.create = jest.fn(() => false);

        // act
        let result = await getService().create(userNotManager, task);

        // assert
        expect(result).toBeNull();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(task.code);
        expect(taskRepositoryMock.create.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.create.mock.calls[0][0]).toEqual(expectedTaskToCreate);
        expect(loggerMock.warning.mock.calls).toHaveLength(1);
        expect(loggerMock.warning.mock.calls[0][0]).toBe(expectedWarningMessage);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });

    test('task was created and returns task', async () => {
        // arrange
        const task = getClonedTask();
        task.userId = null;
        const expectedTaskToCreate = getClonedTask();
        expectedTaskToCreate.closedDate = null;
        taskRepositoryMock.getByCode = jest.fn(() => null);
        taskRepositoryMock.create = jest.fn(() => true);

        // act
        let result = await getService().create(userNotManager, task);

        // assert
        expect(result).toEqual(expectedTaskToCreate);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(task.code);
        expect(taskRepositoryMock.create.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.create.mock.calls[0][0]).toEqual(expectedTaskToCreate);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });
});

describe('update', () => {
    test.each([
        null,
        undefined
    ])('current user is invalid and throws error', async (currentUser) => {
        // arrange
        const expectedError = new Error('currentUser cannot be null.');

        // act & assert
        await expect(getService().update(currentUser, defaultTask.code, defaultTask)).rejects.toEqual(expectedError);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.update.mock.calls).toHaveLength(0);
    });

    test.each([
        null,
        undefined
    ])('task code is invalid and throws error', async (taskCode) => {
        // arrange
        const expectedError = new Error('taskCode cannot be empty.');

        // act & assert
        await expect(getService().update(userNotManager, taskCode, defaultTask)).rejects.toEqual(expectedError);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.update.mock.calls).toHaveLength(0);
    });

    test.each([
        null,
        undefined
    ])('task object is invalid and throws error', async (task) => {
        // arrange
        const expectedError = new Error('task object cannot be null.');

        // act & assert
        await expect(getService().update(userNotManager, defaultTask.code, task)).rejects.toEqual(expectedError);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.update.mock.calls).toHaveLength(0);
    });

    test('repository throws error and returns false', async () => {
        // arrange
        const expectedErrorMessage = 'error updating task:';
        const expectedError = new Error('error in repo.');
        taskRepositoryMock.getByCode = jest.fn().mockRejectedValue(expectedError);

        // act
        let result = await getService().update(userNotManager, defaultTask.code, defaultTask);

        // assert
        expect(result).toBeFalsy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.update.mock.calls).toHaveLength(0);
    });

    test('task does not exist and returns false', async () => {
        // arrange
        const expectedErrorMessage = 'task does not exist:';
        taskRepositoryMock.getByCode = jest.fn(() => null);

        // act
        let result = await getService().update(userNotManager, defaultTask.code, defaultTask);

        // assert
        expect(result).toBeFalsy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toBe(defaultTask.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.update.mock.calls).toHaveLength(0);
    });

    test('task does not belong to current user and returns false', async () => {
        // arrange
        const taskToUpdate = getClonedTask();
        taskToUpdate.userId = '4444';
        const expectedErrorMessage = 'attempt to update other user\' task:';
        taskRepositoryMock.getByCode = jest.fn(() => taskToUpdate);

        // act
        let result = await getService().update(userNotManager, defaultTask.code, defaultTask);

        // assert
        expect(result).toBeFalsy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toBe(userNotManager.id);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.update.mock.calls).toHaveLength(0);
    });

    test('task is already closed and returns false', async () => {
        // arrange
        const taskToUpdate = getClonedTask();
        taskToUpdate.closedDate = new Date();
        const expectedErrorMessage = 'a closed task cannot be updated:';
        taskRepositoryMock.getByCode = jest.fn(() => taskToUpdate);

        // act
        let result = await getService().update(userNotManager, defaultTask.code, defaultTask);

        // assert
        expect(result).toBeFalsy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(taskToUpdate.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.update.mock.calls).toHaveLength(0);
    });

    test('task is not updated and returns false', async () => {
        // arrange
        const taskToUpdate = getClonedTask();
        const expectedErrorMessage = 'task was not updated:'; 
        taskRepositoryMock.getByCode = jest.fn(() => taskToUpdate);
        taskRepositoryMock.update = jest.fn(() => false);

        // act
        let result = await getService().update(userNotManager, defaultTask.code, defaultTask);

        // assert
        expect(result).toBeFalsy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRepositoryMock.update.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.update.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRepositoryMock.update.mock.calls[0][1]).toBe(defaultTask);
        expect(loggerMock.warning.mock.calls).toHaveLength(1);
        expect(loggerMock.warning.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });

    test('task is updated and returns true', async () => {
        // arrange
        const taskToUpdate = getClonedTask();
        taskRepositoryMock.getByCode = jest.fn(() => taskToUpdate);
        taskRepositoryMock.update = jest.fn(() => true);

        // act
        let result = await getService().update(userNotManager, defaultTask.code, defaultTask);

        // assert
        expect(result).toBeTruthy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRepositoryMock.update.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.update.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRepositoryMock.update.mock.calls[0][1]).toBe(defaultTask);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });
});

describe('remove', () => {
    test.each([
        null,
        undefined
    ])('current user is invalid and throws error', async (currentUser) => {
        // arrange
        const expectedError = new Error('currentUser cannot be null.');

        // act & assert
        await expect(getService().remove(currentUser, defaultTask.code)).rejects.toEqual(expectedError);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.remove.mock.calls).toHaveLength(0);
    });
    
    test.each([
        null,
        undefined
    ])('task code is invalid and throws error', async (taskCode) => {
        // arrange
        const expectedError = new Error('taskCode cannot be null.');

        // act & assert
        await expect(getService().remove(userNotManager, taskCode)).rejects.toEqual(expectedError);
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.remove.mock.calls).toHaveLength(0);
    });

    test('repository throws error and returns false', async () => {
        // arrange
        const expectedErrorMessage = 'error removing task:';
        const expectedError = new Error('error in repo.');
        taskRepositoryMock.getByCode = jest.fn().mockRejectedValue(expectedError);

        // act
        let result = await getService().remove(userNotManager, defaultTask.code);

        // assert
        expect(result).toBeFalsy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.remove.mock.calls).toHaveLength(0);
    });

    test('task does not exist and throws error', async () => {
        // arrange
        const expectedErrorMessage = 'task does not exist:';
        taskRepositoryMock.getByCode = jest.fn(() => null);

        // act
        let result = await getService().remove(userNotManager, defaultTask.code);

        // assert
        expect(result).toBeFalsy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toBe(defaultTask.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.remove.mock.calls).toHaveLength(0);
    });

    test('task does not belong to current user and returns false', async () => {
        // arrange
        const taskToDelete = getClonedTask();
        taskToDelete.userId = '4444';
        const expectedErrorMessage = 'attempt to delete other user\' task:';
        taskRepositoryMock.getByCode = jest.fn(() => [taskToDelete]);

        // act
        let result = await getService().remove(userNotManager, defaultTask.code);

        // assert
        expect(result).toBeFalsy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toBe(userNotManager.id);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRepositoryMock.remove.mock.calls).toHaveLength(0);
    });

    test('task is not removed and returns false', async () => {
        // arrange
        const taskToDelete = getClonedTask();
        const expectedErrorMessage = 'task was not removed.'; 
        taskRepositoryMock.getByCode = jest.fn(() => taskToDelete);
        taskRepositoryMock.remove = jest.fn(() => false);

        // act
        let result = await getService().remove(userNotManager, defaultTask.code);

        // assert
        expect(result).toBeFalsy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRepositoryMock.remove.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.remove.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(1);
        expect(loggerMock.warning.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });

    test('task is removed and returns true', async () => {
        // arrange
        const taskToDelete = getClonedTask();
        taskRepositoryMock.getByCode = jest.fn(() => taskToDelete);
        taskRepositoryMock.remove = jest.fn(() => true);

        // act
        let result = await getService().remove(userNotManager, defaultTask.code);

        // assert
        expect(result).toBeTruthy();
        expect(taskRepositoryMock.getByCode.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.getByCode.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRepositoryMock.remove.mock.calls).toHaveLength(1);
        expect(taskRepositoryMock.remove.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });
});