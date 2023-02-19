const taskServiceMock = jest.createMockFromModule('../../services/taskService');
const taskApi = require('../tasksApi');
const Task = require('../../models/task');

const moreThanHalfOf2500Characters = Array(1251).fill().map((_, i, arr) => 'a');
const getApi = () => taskApi(taskServiceMock);
const defaultUser = { isManager: false, id: 1234 };
const defaultTask = new Task('1234', 'testing', false, null, 1234);
let responseMock = {
    status: () => { },
    send: () => { }
}

beforeEach(() => {
    taskServiceMock.list = jest.fn(() => { });
    taskServiceMock.get = jest.fn(() => { });
    taskServiceMock.create = jest.fn(() => { });
    taskServiceMock.update = jest.fn(() => { });
    taskServiceMock.remove = jest.fn(() => { });

    responseMock.status = jest.fn(() => responseMock);
    responseMock.send = jest.fn(() => { });
});

describe('parameters', () => {
    test.each([
       null,
       undefined
    ])('taskService is invalid and throws error', (taskService) => {
       // arrange
       const expectError = new Error('task service cannot be empty.');
       
       // act
       let func = () => taskApi(taskService);
 
       // act & assert
       expect(func).toThrow(expectError);
    });
});

describe('list', () => {
    test('taskService.list throws error and returns internal server error', async () => {
        // arrange
        const request = { currentUser: defaultUser };
        const expectedStatus = 500;
        const expectedError = 'internal error';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.list = jest.fn().mockRejectedValue(expectedError);

        // act
        await getApi().list(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.list.mock.calls).toHaveLength(1);
        expect(taskServiceMock.list.mock.calls[0][0]).toBe(defaultUser);
    });

    test('taskService.list returns error and returns not found', async () => {
        // arrange
        const request = { currentUser: defaultUser };
        const expectedStatus = 404;
        const expectedError = 'tasks dont exist';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.list = jest.fn(() => [{ exception: 201, content: expectedError }, null])

        // act
        await getApi().list(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.list.mock.calls).toHaveLength(1);
        expect(taskServiceMock.list.mock.calls[0][0]).toBe(defaultUser);
    });

    test('taskService.list resturns data and returns ok', async () => {
        // arrange
        const request = { currentUser: defaultUser };
        const expectedStatus = 200;
        const expectedResponseBody = { error: null, data: [defaultTask] };
        taskServiceMock.list = jest.fn(() => [null, [defaultTask]])

        // act
        await getApi().list(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.list.mock.calls).toHaveLength(1);
        expect(taskServiceMock.list.mock.calls[0][0]).toBe(defaultUser);
    });
});

describe('get', () => {
    test('taskService.get throws error and returns internal server error', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code} };
        const expectedStatus = 500;
        const expectedError = 'internal error';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.get = jest.fn().mockRejectedValue(expectedError);

        // act
        await getApi().get(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.get.mock.calls).toHaveLength(1);
        expect(taskServiceMock.get.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.get.mock.calls[0][1]).toBe(defaultTask.code);
    });

    test('taskService.get returns error and returns not found', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code} };
        const expectedStatus = 404;
        const expectedError = 'task does not exist';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.get = jest.fn(() => [{ exception: 201, content: expectedError }, null])

        // act
        await getApi().get(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.get.mock.calls).toHaveLength(1);
        expect(taskServiceMock.get.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.get.mock.calls[0][1]).toBe(defaultTask.code);
    });

    test('taskService.get resturns data and returns ok', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code } };
        const expectedStatus = 200;
        const expectedResponseBody = { error: null, data: [defaultTask] };
        taskServiceMock.get = jest.fn(() => [null, [defaultTask]])

        // act
        await getApi().get(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.get.mock.calls).toHaveLength(1);
        expect(taskServiceMock.get.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.get.mock.calls[0][1]).toBe(defaultTask.code);
    });
});

describe('post', () => {
    test('request body is invalid and returns bad request', async () => {
        // arrange
        const request = { currentUser: defaultUser, body: null };
        const expectedStatus = 400;
        const expectedError = 'request body cannot be empty';
        const expectedResponseBody = { error: expectedError, data: null };

        // act
        await getApi().post(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.create.mock.calls).toHaveLength(0);
    });

    const parametersValidationTestInput = [
        {
            requestBody: { summary: 'testing' },
            expectedError: { 'task.code': 'property cannot be empty.' }
        },
        {
            requestBody: { code: '1234', summary: moreThanHalfOf2500Characters.join(' ') },
            expectedError: { 'task.summary': 'property exceeds allowed length of 2500 characters.' }
        },
        {
            requestBody: { code: '12345678901234567' },
            expectedError: { 'task.code': 'property exceeds allowed length of 16 characters.' }
        },
        {
            requestBody: { code: '12345678901234567', hasSensitiveData: 1234 },
            expectedError: { 'task.code': 'property exceeds allowed length of 16 characters.', 'task.hasSensitiveData': 'property must be of type boolean.' },
        }
    ]

    test.each(parametersValidationTestInput)('task request\'s parameters check fails and returns bad request', async ({requestBody, expectedError}) => {
        // arrange
        const request = { currentUser: defaultUser, body: requestBody };
        const expectedStatus = 400;
        const expectedResponseBody = { error: expectedError, data: null };

        // act
        await getApi().post(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.create.mock.calls).toHaveLength(0);
    });

    test('taskService.create throws error and returns internal server error', async () => {
        // arrange
        const request = { currentUser: defaultUser, body: defaultTask };
        const expectedStatus = 500;
        const expectedError = 'internal error';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.create = jest.fn().mockRejectedValue(expectedError);

        // act
        await getApi().post(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.create.mock.calls).toHaveLength(1);
        expect(taskServiceMock.create.mock.calls[0][0]).toBe(defaultUser);
    });

    test('taskService.create returns error and returns bad request', async () => {
        // arrange
        const request = { currentUser: defaultUser, body: defaultTask };
        const expectedTaskToCreate = new Task(
            defaultTask.code,
            defaultTask.summary,
            defaultTask.hasSensitiveData
        );
        const expectedStatus = 400;
        const expectedError = 'task.code must be unique';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.create = jest.fn(() => [{ exception: 202, content: expectedError }, null])

        // act
        await getApi().post(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.create.mock.calls).toHaveLength(1);
        expect(taskServiceMock.create.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.create.mock.calls[0][1]).toEqual(expectedTaskToCreate);
    });

    test('taskService.create accepts data and returns ok', async () => {
        // arrange
        const request = { currentUser: defaultUser, body: defaultTask };
        const expectedTaskToCreate = new Task(
            defaultTask.code,
            defaultTask.summary,
            defaultTask.hasSensitiveData
        );
        const expectedTaskToReceive = new Task(
            defaultTask.code,
            defaultTask.summary,
            defaultTask.hasSensitiveData
        );
        expectedTaskToReceive.userId = defaultUser.id;
        expectedTaskToReceive.closedDate = null;
        const expectedStatus = 201;
        const expectedResponseBody = { error: null, data: expectedTaskToReceive };
        taskServiceMock.create = jest.fn(() => [null, expectedTaskToReceive])

        // act
        await getApi().post(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.create.mock.calls).toHaveLength(1);
        expect(taskServiceMock.create.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.create.mock.calls[0][1]).toEqual(expectedTaskToCreate);
    });
});

describe('patch', () => {
    test('request body is invalid and returns bad request', async () => {
        // arrange
        const request = { currentUser: defaultUser, body: null };
        const expectedStatus = 400;
        const expectedError = 'request body cannot be empty';
        const expectedResponseBody = { error: expectedError, data: null };

        // act
        await getApi().patch(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.update.mock.calls).toHaveLength(0);
    });

    const parametersValidationTestInput = [
        {
            requestBody: { summary: moreThanHalfOf2500Characters.join(' ') },
            expectedError: { 'task.summary': 'property exceeds allowed length of 2500 characters.' }
        },
        {
            requestBody: { hasSensitiveData: 1234 },
            expectedError: { 'task.hasSensitiveData': 'property must be of type boolean.' },
        }
    ]

    test.each(parametersValidationTestInput)('task request\'s parameters check fails and returns bad request', async ({requestBody, expectedError}) => {
        // arrange
        const request = { currentUser: defaultUser, body: requestBody };
        const expectedStatus = 400;
        const expectedResponseBody = { error: expectedError, data: null };

        // act
        await getApi().patch(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.create.mock.calls).toHaveLength(0);
    });

    test('taskService.update throws error and returns internal server error', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code }, body: defaultTask };
        const expectedStatus = 500;
        const expectedError = 'internal error';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.update = jest.fn().mockRejectedValue(expectedError);

        // act
        await getApi().patch(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.update.mock.calls).toHaveLength(1);
        expect(taskServiceMock.update.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.update.mock.calls[0][1]).toBe(defaultTask.code);
        expect(taskServiceMock.update.mock.calls[0][2]).toBe(defaultTask);
    });

    test('taskService.update returns error and returns not found', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code }, body: defaultTask };
        const expectedStatus = 404;
        const expectedError = 'task does not exist';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.update = jest.fn(() => [{ exception: 201, content: expectedError }, null])

        // act
        await getApi().patch(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.update.mock.calls).toHaveLength(1);
        expect(taskServiceMock.update.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.update.mock.calls[0][1]).toBe(defaultTask.code);
        expect(taskServiceMock.update.mock.calls[0][2]).toBe(defaultTask);
    });

    test('taskService.update accepts data and returns no content', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code }, body: defaultTask };
        const expectedStatus = 204;
        taskServiceMock.update = jest.fn(() => [null, true])

        // act
        await getApi().patch(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toBeUndefined;
        expect(taskServiceMock.update.mock.calls).toHaveLength(1);
        expect(taskServiceMock.update.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.update.mock.calls[0][1]).toBe(defaultTask.code);
        expect(taskServiceMock.update.mock.calls[0][2]).toBe(defaultTask);
    });
});

describe('patchCloseDate', () => {
    test('taskService.update throws error and returns internal server error', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code } };
        const expectedStatus = 500;
        const expectedError = 'internal error';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.update = jest.fn().mockRejectedValue(expectedError);

        // act
        await getApi().patchCloseDate(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.update.mock.calls).toHaveLength(1);
        expect(taskServiceMock.update.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.update.mock.calls[0][1]).toBe(defaultTask.code);
        expect(taskServiceMock.update.mock.calls[0][2]).not.toBeNull();
    });

    test('taskService.update returns error and returns not found', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code} };
        const expectedStatus = 404;
        const expectedError = 'task does not exist';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.update = jest.fn(() => [{ exception: 201, content: expectedError }, null])

        // act
        await getApi().patchCloseDate(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.update.mock.calls).toHaveLength(1);
        expect(taskServiceMock.update.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.update.mock.calls[0][1]).toBe(defaultTask.code);
        expect(taskServiceMock.update.mock.calls[0][2]).not.toBeNull();
    });

    test('taskService.update resturns data and returns ok', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code } };
        const expectedStatus = 204;
        taskServiceMock.update = jest.fn(() => [null, true])

        // act
        await getApi().patchCloseDate(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toBeUndefined();
        expect(taskServiceMock.update.mock.calls).toHaveLength(1);
        expect(taskServiceMock.update.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.update.mock.calls[0][1]).toBe(defaultTask.code);
        expect(taskServiceMock.update.mock.calls[0][2]).not.toBeNull();
    });
});

describe('remove', () => {
    test('taskService.remove throws error and returns internal server error', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code } };
        const expectedStatus = 500;
        const expectedError = 'internal error';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.remove = jest.fn().mockRejectedValue(expectedError);

        // act
        await getApi().remove(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.remove.mock.calls).toHaveLength(1);
        expect(taskServiceMock.remove.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.remove.mock.calls[0][1]).toBe(defaultTask.code);
    });

    test('taskService.remove returns error and returns not found', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code} };
        const expectedStatus = 404;
        const expectedError = 'task does not exist';
        const expectedResponseBody = { error: expectedError, data: null };
        taskServiceMock.remove = jest.fn(() => [{ exception: 201, content: expectedError }, null])

        // act
        await getApi().remove(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(taskServiceMock.remove.mock.calls).toHaveLength(1);
        expect(taskServiceMock.remove.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.remove.mock.calls[0][1]).toBe(defaultTask.code);
    });

    test('taskService.remove resturns data and returns ok', async () => {
        // arrange
        const request = { currentUser: defaultUser, params: { code: defaultTask.code } };
        const expectedStatus = 204;
        taskServiceMock.remove = jest.fn(() => [null, true])

        // act
        await getApi().remove(request, responseMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toBeUndefined();
        expect(taskServiceMock.remove.mock.calls).toHaveLength(1);
        expect(taskServiceMock.remove.mock.calls[0][0]).toBe(defaultUser);
        expect(taskServiceMock.remove.mock.calls[0][1]).toBe(defaultTask.code);
    });
});