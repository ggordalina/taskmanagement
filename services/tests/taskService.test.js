const taskRespositoryMock = jest.createMockFromModule('../../respositories/taskRespository');
const loggerMock = jest.createMockFromModule('../../logger/logger');
const taskService = require('../taskService');
const User = require('../../models/user');
const UserRole = require('../../models/userRole');
const Task = require('../../models/task');

const userNotManager = new User('341', '9988', 'Clive', '0987');
const userManager = new User('1234', '12312', 'James', '1234');
userManager.setRole(new UserRole('123', 'Manager'));
const defaultTask = new Task('123', 'pid-7788', 'simple', false, null, userNotManager.id);

getService = (user = null) => taskService(taskRespositoryMock, loggerMock, user ?? userNotManager);
getClonedTask = () => new Task(
    defaultTask.id,
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

    taskRespositoryMock.list = jest.fn(() => { });
    taskRespositoryMock.listByUserId = jest.fn(() => { });
    taskRespositoryMock.get = jest.fn(() => { });
    taskRespositoryMock.create = jest.fn(() => { });
    taskRespositoryMock.update = jest.fn(() => { });
    taskRespositoryMock.remove = jest.fn(() => { });
});

describe('service parameters', () => {
    test.each([
        null, 
        undefined
    ])('repository is invalid', (repository) => {
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
    ])('logger is invalid', (logger) => {
        // arrange
        const expectError = new Error('logger cannot be empty.');
        
        // act
        let func = () => taskService(taskRespositoryMock, logger, userManager);

        // act & assert
        expect(func).toThrow(expectError);
    });

    test.each([
        null, 
        undefined
    ])('currentUser is invalid', (currentUser) => {
        // arrange
        const expectError = new Error('currentUser cannot be empty.');
        
        // act
        let func = () => taskService(taskRespositoryMock, loggerMock, currentUser);

        // act & assert
        expect(func).toThrow(expectError);
    });
});

describe('list', () => {
    describe('user is manager', () => {
        test('repository throws error and returns empty array', async () => {
            // arrange 
            const expectedErrorMessage = 'error retrieving tasks:';
            const expectedError = new Error('error in repo.');
            taskRespositoryMock.list = jest.fn().mockRejectedValue(expectedError);

            // act
            let result = await getService(userManager).list();

            // assert
            expect(result).toEqual([]);
            expect(taskRespositoryMock.list.mock.calls).toHaveLength(1);
            expect(loggerMock.error.mock.calls).toHaveLength(1);
            expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
            expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        });

        test('repository returns content and returns its content', async () => {
            // arrange 
            taskRespositoryMock.list = jest.fn(() => [defaultTask]);

            // act
            let result = await getService(userManager).list();

            // assert
            expect(result).toEqual([defaultTask]);
            expect(taskRespositoryMock.list.mock.calls).toHaveLength(1);
            expect(loggerMock.error.mock.calls).toHaveLength(0);
        });
    });

    describe('user is not manager', () => {
        test('repository throws error and returns empty array', async () => {
            // arrange 
            const expectedErrorMessage = 'error retrieving tasks:';
            const expectedError = new Error('error in repo.');
            taskRespositoryMock.listByUserId = jest.fn().mockRejectedValue(expectedError);

            // act
            let result = await getService().list();

            // assert
            expect(result).toEqual([]);
            expect(taskRespositoryMock.listByUserId.mock.calls).toHaveLength(1);
            expect(taskRespositoryMock.listByUserId.mock.calls[0][0]).toBe(userNotManager.id);
            expect(loggerMock.error.mock.calls).toHaveLength(1);
            expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
            expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        });

        test('repository returns content and returns its content', async () => {
            // arrange 
            taskRespositoryMock.listByUserId = jest.fn(() => [defaultTask]);

            // act
            let result = await getService().list();

            // assert
            expect(result).toEqual([defaultTask]);
            expect(taskRespositoryMock.listByUserId.mock.calls).toHaveLength(1);
            expect(taskRespositoryMock.listByUserId.mock.calls[0][0]).toBe(userNotManager.id);
            expect(loggerMock.error.mock.calls).toHaveLength(0);
        });
    });
});

describe('get', () => {
    test.each([
        null,
        undefined
    ])('taskcode is invalid and throws error', async (taskCode) => {
        // arrange
        const expectedError = new Error('taskCode cannot be empty.');

        // act & assert
        await expect(getService().get(taskCode)).rejects.toEqual(expectedError);
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(0);
    });

    test('repository throws error and returns null', async () => {
        // arrange
        const expectedErrorMessage = 'error retrieving task:';
        const expectedError = new Error('error in repo.');
        taskRespositoryMock.get = jest.fn().mockRejectedValue(expectedError);

        // act
        let result = await getService().get(defaultTask.code);

        // assert
        expect(result).toBeNull();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
    });

    test('repository returns empty result and returns null', async () => {
        // arrange
        taskRespositoryMock.get = jest.fn(() => [ ]);

        // act
        let result = await getService().get(defaultTask.code);

        // assert
        expect(result).toBeNull();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
    });

    test('user is manager and task does not belong to user and returns task', async () => {
        // arrage
        let task = getClonedTask();
        taskRespositoryMock.get = jest.fn(() => [task]);

        // act
        let result = await getService(userManager).get(task.code);

        // assert
        expect(result).toEqual(task);
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(task.code);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
    });

    test('task does not belong to user and returns null', async () => {
        // arrange
        const expectedResult = getClonedTask();
        expectedResult.userId = '4444';
        const expectedWarningMessage = 'retrival task attempt on authorized user.';
        taskRespositoryMock.get = jest.fn(() => [expectedResult]);

        // act
        let result = await getService().get(expectedResult.code);

        // assert
        expect(result).toBeNull();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(expectedResult.code);
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
        taskRespositoryMock.get = jest.fn(() => [expectedResult]);

        // act
        let result = await getService().get(expectedResult.code);

        // assert
        expect(result).toEqual(expectedResult);
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(expectedResult.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });

    test('returns valid task', async () => {
        // arrange
        const task = getClonedTask();
        taskRespositoryMock.get = jest.fn(() => [task]);

        // act
        let result = await getService().get(task.code);

        // assert
        expect(result).toEqual(task);
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(task.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });
});

describe('create', () => {
    test.each([
        null,
        undefined
    ])('task object is invalid and throws error', async (task) => {
        // arrange
        const expectedError = new Error('task object cannot be empty.');

        // act & assert
        await expect(getService().create(task)).rejects.toEqual(expectedError);
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(0);
        expect(taskRespositoryMock.create.mock.calls).toHaveLength(0);
    });

    test('repository throws error and returns null', async () => {
        // arrange
        const expectedErrorMessage = 'error saving task:';
        const expectedError = new Error('error in repo.');
        taskRespositoryMock.get = jest.fn().mockRejectedValue(expectedError);

        // act
        let result = await getService().create(defaultTask);

        // assert
        expect(result).toBeNull();
        // expect(taskRespositoryMock.get.mock.calls).toHaveLength(1); // TODO: check why 0
        // expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
    });

    test('task already exists and throws error', async () => {
        // arrange
        const expectedErrorMessage = 'task.code must be unique.';
        taskRespositoryMock.get = jest.fn(() => [defaultTask]);

        let result = await getService().create(defaultTask);

        // assert 
        expect(result).toBeNull();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(taskRespositoryMock.create.mock.calls).toHaveLength(0);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
    });

    test('task was not created and returns null', async () => {
        // arrange
        const task = getClonedTask();
        task.userId = null;
        const expectedTaskToCreate = getClonedTask();
        task.userId = userNotManager.id;
        task.closedDate = null;
        const expectedWarningMessage = 'task was not created.';
        taskRespositoryMock.get = jest.fn(() => []);
        taskRespositoryMock.create = jest.fn(() => false);

        // act
        let result = await getService().create(task);

        // assert
        expect(result).toBeNull();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(task.code);
        expect(taskRespositoryMock.create.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.create.mock.calls[0][0]).toEqual(expectedTaskToCreate);
        expect(loggerMock.warning.mock.calls).toHaveLength(1);
        expect(loggerMock.warning.mock.calls[0][0]).toBe(expectedWarningMessage);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });

    test('task was created and returns task', async () => {
        // arrange
        const task = getClonedTask();
        task.userId = null;
        const expectedTaskToCreate = getClonedTask();
        expectedTaskToCreate.userId = userNotManager.id;
        expectedTaskToCreate.closedDate = null;
        taskRespositoryMock.get = jest.fn(() => []);
        taskRespositoryMock.create = jest.fn(() => true);

        // act
        let result = await getService().create(task);

        // assert
        expect(result).toEqual(expectedTaskToCreate);
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(task.code);
        expect(taskRespositoryMock.create.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.create.mock.calls[0][0]).toEqual(expectedTaskToCreate);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });
});

describe('update', () => {
    test.each([
        null,
        undefined
    ])('task object is invalid and throws error', async (task) => {
        // arrange
        const expectedError = new Error('task object cannot be null.');

        // act & assert
        await expect(getService().update(task)).rejects.toEqual(expectedError);
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(0);
        expect(taskRespositoryMock.update.mock.calls).toHaveLength(0);
    });

    test('repository throws error and returns false', async () => {
        // arrange
        const expectedErrorMessage = 'error updating task:';
        const expectedError = new Error('error in repo.');
        taskRespositoryMock.get = jest.fn().mockRejectedValue(expectedError);

        // act
        let result = await getService().update(defaultTask);

        // assert
        expect(result).toBeFalsy();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRespositoryMock.update.mock.calls).toHaveLength(0);
    });

    test('task does not exist and returns false', async () => {
        // arrange
        const expectedErrorMessage = 'task does not exist.';
        taskRespositoryMock.get = jest.fn(() => []);

        // act
        let result = await getService().update(defaultTask);

        // assert
        expect(result).toBeFalsy();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRespositoryMock.update.mock.calls).toHaveLength(0);
    });

    test('task does not belong to current user and returns false', async () => {
        // arrange
        const taskToUpdate = getClonedTask();
        taskToUpdate.userId = '4444';
        const expectedErrorMessage = 'attempt to update other user\' task:';
        taskRespositoryMock.get = jest.fn(() => [taskToUpdate]);

        // act
        let result = await getService().update(defaultTask);

        // assert
        expect(result).toBeFalsy();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toBe(userNotManager.id);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRespositoryMock.update.mock.calls).toHaveLength(0);
    });

    test('task is already closed and returns false', async () => {
        // arrange
        const taskToUpdate = getClonedTask();
        taskToUpdate.closedDate = new Date();
        const expectedErrorMessage = 'a closed task cannot be updated:';
        taskRespositoryMock.get = jest.fn(() => [taskToUpdate]);

        // act
        let result = await getService().update(defaultTask);

        // assert
        expect(result).toBeFalsy();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(taskToUpdate.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRespositoryMock.update.mock.calls).toHaveLength(0);
    });

    test('task is not updated and returns false', async () => {
        // arrange
        const taskToUpdate = getClonedTask();
        const expectedErrorMessage = 'task was not updated.'; 
        taskRespositoryMock.get = jest.fn(() => [taskToUpdate]);
        taskRespositoryMock.update = jest.fn(() => []);

        // act
        let result = await getService().update(defaultTask);

        // assert
        expect(result).toBeFalsy();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRespositoryMock.update.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.update.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRespositoryMock.update.mock.calls[0][1]).toBe(defaultTask);
        expect(loggerMock.warning.mock.calls).toHaveLength(1);
        expect(loggerMock.warning.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });

    test('task is updated and returns true', async () => {
        // arrange
        const taskToUpdate = getClonedTask();
        taskRespositoryMock.get = jest.fn(() => [taskToUpdate]);
        taskRespositoryMock.update = jest.fn(() => [taskToUpdate]);

        // act
        let result = await getService().update(defaultTask);

        // assert
        expect(result).toBeTruthy();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRespositoryMock.update.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.update.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRespositoryMock.update.mock.calls[0][1]).toBe(defaultTask);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });
});

describe('remove', () => {
    test.each([
        null,
        undefined
    ])('taskcode is invalid and throws error', async (taskCode) => {
        // arrange
        const expectedError = new Error('taskCode cannot be null');

        // act & assert
        await expect(getService().remove(taskCode)).rejects.toEqual(expectedError);
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(0);
        expect(taskRespositoryMock.remove.mock.calls).toHaveLength(0);
    });

    test('repository throws error and returns false', async () => {
        // arrange
        const expectedErrorMessage = 'error removing task:';
        const expectedError = new Error('error in repo.');
        taskRespositoryMock.get = jest.fn().mockRejectedValue(expectedError);

        // act
        let result = await getService().remove(defaultTask.code);

        // assert
        expect(result).toBeFalsy();
        // expect(taskRespositoryMock.get.mock.calls).toHaveLength(1); // TODO: why 0
        // expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRespositoryMock.remove.mock.calls).toHaveLength(0);
    });

    test('task does not exist and throws error', async () => {
        // arrange
        const expectedErrorMessage = 'task does not exist.';
        taskRespositoryMock.get = jest.fn(() => []);

        // act
        let result = await getService().remove(defaultTask.code);

        // assert
        expect(result).toBeFalsy();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRespositoryMock.remove.mock.calls).toHaveLength(0);
    });

    test('task does not belong to current user and returns false', async () => {
        // arrange
        const taskToDelete = getClonedTask();
        taskToDelete.userId = '4444';
        const expectedErrorMessage = 'attempt to delete other user\' task:';
        taskRespositoryMock.get = jest.fn(() => [taskToDelete]);

        // act
        let result = await getService().remove(defaultTask.code);

        // assert
        expect(result).toBeFalsy();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toBe(userNotManager.id);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(taskRespositoryMock.remove.mock.calls).toHaveLength(0);
    });

    test('task is not removed and returns false', async () => {
        // arrange
        const taskToDelete = getClonedTask();
        const expectedErrorMessage = 'task was not removed.'; 
        taskRespositoryMock.get = jest.fn(() => [taskToDelete]);
        taskRespositoryMock.remove = jest.fn(() => []);

        // act
        let result = await getService().remove(defaultTask.code);

        // assert
        expect(result).toBeFalsy();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRespositoryMock.remove.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.remove.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(1);
        expect(loggerMock.warning.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });

    test('task is removed and returns true', async () => {
        // arrange
        const taskToDelete = getClonedTask();
        taskRespositoryMock.get = jest.fn(() => [taskToDelete]);
        taskRespositoryMock.remove = jest.fn(() => [taskToDelete]);

        // act
        let result = await getService().remove(defaultTask.code);

        // assert
        expect(result).toBeTruthy();
        expect(taskRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.get.mock.calls[0][0]).toBe(defaultTask.code);
        expect(taskRespositoryMock.remove.mock.calls).toHaveLength(1);
        expect(taskRespositoryMock.remove.mock.calls[0][0]).toBe(defaultTask.code);
        expect(loggerMock.warning.mock.calls).toHaveLength(0);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });
});