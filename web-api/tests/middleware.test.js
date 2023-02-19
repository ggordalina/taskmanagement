const userServiceMock = jest.createMockFromModule('../../services/userService');
const middleware = require('../middleware');
const User = require('../../models/user');

const defaultUser = new User(1234, 78768, 'Tester', 1234);
const getMiddleware = () => middleware(userServiceMock);
let responseMock = {
    status: () => { },
    send: () => { }
}
let nextMock = () => { };

beforeEach(() => {
    userServiceMock.get = jest.fn(() => { });
    responseMock.status = jest.fn(() => responseMock);
    responseMock.send = jest.fn(() => { });
    nextMock = jest.fn(() => { });
});

describe('parameters', () => {
    test.each([
       null,
       undefined
    ])('userService is invalid and throws error', (userService) => {
       // arrange
       const expectError = new Error('user service cannot be empty.');
       
       // act
       let func = () => middleware(userService);
 
       // act & assert
       expect(func).toThrow(expectError);
    })
});

describe('verifyEmployee', () => {
    test.each([
        null,
        undefined
    ])('request query is invalid and returns bad request', async (query) => {
        // arrange
        const request = { query: query }
        const expectedStatus = 400;
        const expectedError = 'employeeId cannot be empty';
        const expectedResponseBody = { error: expectedError, data: null };

        // act
        await getMiddleware().verifyEmployee(request, responseMock, nextMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(userServiceMock.get.mock.calls).toHaveLength(0);
        expect(nextMock.mock.calls).toHaveLength(0);
    });
    
    test.each([
        null,
        undefined
    ])('employeeId query param is invalid and returns bad request', async (employeeId) => {
        // arrange
        const request = { query: { employeeId: employeeId }}
        const expectedStatus = 400;
        const expectedError = 'employeeId cannot be empty';
        const expectedResponseBody = { error: expectedError, data: null };

        // act
        await getMiddleware().verifyEmployee(request, responseMock, nextMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(userServiceMock.get.mock.calls).toHaveLength(0);
        expect(nextMock.mock.calls).toHaveLength(0);
    });

    test('user service throws error and returns internal error', async () => {
        // arrange
        const request = { query: { employeeId: defaultUser.employeeNumber }};
        const expectedStatus = 500;
        const expectedError = 'internal error';
        const expectedResponseBody = { error: expectedError, data: null };
        userServiceMock.get = jest.fn().mockRejectedValue(expectedError);

        // act
        await getMiddleware().verifyEmployee(request, responseMock, nextMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(userServiceMock.get.mock.calls).toHaveLength(1);
        expect(userServiceMock.get.mock.calls[0][0]).toBe(defaultUser.employeeNumber);
        expect(nextMock.mock.calls).toHaveLength(0);
    });

    test('user service returns null and returns not found', async () => {
        // arrange
        const request = { query: { employeeId: defaultUser.employeeNumber }};
        const expectedStatus = 404;
        const expectedError = 'user does not exist';
        const expectedResponseBody = { error: expectedError, data: null };
        userServiceMock.get = jest.fn(() => [{ exception: 301, content: expectedError }, null])

        // act
        await getMiddleware().verifyEmployee(request, responseMock, nextMock);

        // assert
        expect(responseMock.status.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls[0][0]).toBe(expectedStatus);
        expect(responseMock.send.mock.calls).toHaveLength(1);
        expect(responseMock.send.mock.calls[0][0]).toEqual(expectedResponseBody);
        expect(userServiceMock.get.mock.calls).toHaveLength(1);
        expect(userServiceMock.get.mock.calls[0][0]).toBe(defaultUser.employeeNumber);
        expect(nextMock.mock.calls).toHaveLength(0);
    });

    test('user service returns user and calls next', async () => {
        // arrange
        const request = { query: { employeeId: defaultUser.employeeNumber }};
        userServiceMock.get = jest.fn(() => [null, defaultUser])

        // act
        await getMiddleware().verifyEmployee(request, responseMock, nextMock);

        // assert
        expect(userServiceMock.get.mock.calls).toHaveLength(1);
        expect(userServiceMock.get.mock.calls[0][0]).toBe(defaultUser.employeeNumber);
        expect(nextMock.mock.calls).toHaveLength(1);
        expect(responseMock.status.mock.calls).toHaveLength(0);
        expect(responseMock.send.mock.calls).toHaveLength(0);
    });
});