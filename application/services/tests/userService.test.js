const userRespositoryMock = jest.createMockFromModule('../../respositories/userRepository');
const userRoleRespositoryMock = jest.createMockFromModule('../../respositories/userRoleRepository');
const loggerMock = jest.createMockFromModule('../../utils/logger');
const { AppError, ApplicationExceptions } = require('../../utils/applicationExceptions');
const userService = require('../userService');
const User = require('../../models/user');
const UserRole = require('../../models/userRole');

const getService = () => userService(userRespositoryMock, userRoleRespositoryMock, loggerMock);
const defaultUserRole = new UserRole('1234', 'Manager');
const defaultUser = new User('1234', '44553', 'James', defaultUserRole.id);

beforeEach(() => {
    loggerMock.info = jest.fn(() => { });
    loggerMock.warning = jest.fn(() => { });
    loggerMock.error = jest.fn(() => { });

    userRespositoryMock.getByEmployeeNumber = jest.fn(() => { });
    userRoleRespositoryMock.get = jest.fn(() => { });
});

describe('parameters', () => {
    test.each([
        null, 
        undefined
    ])('userRepository is invalid and throws error', (userRepository) => {
        // arrange
        const expectError = new Error('userRepository cannot be empty.');
        
        // act
        let func = () => userService(userRepository, userRoleRespositoryMock, loggerMock);

        // act & assert
        expect(func).toThrow(expectError);
    });

    test.each([
        null, 
        undefined
    ])('userRoleRepository is invalid and throws error', (userRoleRepository) => {
        // arrange
        const expectError = new Error('userRoleRepository cannot be empty.');
        
        // act
        let func = () => userService(userRespositoryMock, userRoleRepository, loggerMock);

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
        let func = () => userService(userRespositoryMock, userRoleRespositoryMock, logger);

        // act & assert
        expect(func).toThrow(expectError);
    });
});

describe('get', () => {
    test.each([
        null,
        undefined,
        ''
    ])('employeeNumber is invalid and throws error', async (employeeNumber) => {
        // arrange
        const expectedError = new Error('employeeNumber cannot be empty.');

        // act & assert
        await expect(getService().get(employeeNumber)).rejects.toEqual(expectedError);
        expect(userRespositoryMock.getByEmployeeNumber.mock.calls).toHaveLength(0);
        expect(userRoleRespositoryMock.get.mock.calls).toHaveLength(0);
    });

    test('userRepository throws error and returns null', async () => {
        // arrange
        const expectedErrorMessage = 'error retrieving user:';
        const expectedError = new Error('error in repo.');
        const expectedAppError = new AppError(ApplicationExceptions.DataAccess, 'error retrieving user');
        const expectedResult = [expectedAppError, null];
        userRespositoryMock.getByEmployeeNumber = jest.fn().mockRejectedValue(expectedError);

        // act
        let result = await getService().get(defaultUser.employeeNumber);

        // assert
        expect(result).toEqual(expectedResult);
        expect(userRespositoryMock.getByEmployeeNumber.mock.calls).toHaveLength(1);
        expect(userRespositoryMock.getByEmployeeNumber.mock.calls[0][0]).toBe(defaultUser.employeeNumber);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(expectedError);
        expect(userRoleRespositoryMock.get.mock.calls).toHaveLength(0);
    });

    test('user does not exist and returns null', async () => {
        // arrange
        const expectedErrorMessage = 'user does not exist:';
        const expectedAppError = new AppError(ApplicationExceptions.UserNotFound, 'user does not exist');
        const expectedResult = [expectedAppError, null];
        userRespositoryMock.getByEmployeeNumber = jest.fn(() => null);

        // act
        let result = await getService().get(defaultUser.employeeNumber);

        // assert
        expect(result).toEqual(expectedResult);
        expect(userRespositoryMock.getByEmployeeNumber.mock.calls).toHaveLength(1);
        expect(userRespositoryMock.getByEmployeeNumber.mock.calls[0][0]).toBe(defaultUser.employeeNumber);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(defaultUser.employeeNumber);
        expect(userRoleRespositoryMock.get.mock.calls).toHaveLength(0);
    });

    test('user role does not exist and returns null', async () => {
        // arrange
        const expectedErrorMessage = `unable to identify user's ${defaultUser.employeeNumber} role:`;
        const expectedAppError = new AppError(ApplicationExceptions.UserNotFound, 'user does not exist');
        const expectedResult = [expectedAppError, null];
        userRespositoryMock.getByEmployeeNumber = jest.fn(() => defaultUser);
        userRoleRespositoryMock.get = jest.fn(() => null);

        // act
        let result = await getService().get(defaultUser.employeeNumber);

        // assert
        expect(result).toEqual(expectedResult);
        expect(userRespositoryMock.getByEmployeeNumber.mock.calls).toHaveLength(1);
        expect(userRespositoryMock.getByEmployeeNumber.mock.calls[0][0]).toBe(defaultUser.employeeNumber);
        expect(userRoleRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(userRoleRespositoryMock.get.mock.calls[0][0]).toBe(defaultUser.userRoleId);
        expect(loggerMock.error.mock.calls).toHaveLength(1);
        expect(loggerMock.error.mock.calls[0][0]).toBe(expectedErrorMessage);
        expect(loggerMock.error.mock.calls[0][1]).toEqual(defaultUser.userRoleId);
    });

    test('user and its role does exist and returns user', async () => {
        // arrange
        const clonedUser = new User(defaultUser.id, defaultUser.employeeNumber, defaultUser.name, defaultUser.userRoleId);
        const expectedUser = new User(defaultUser.id, defaultUser.employeeNumber, defaultUser.name, defaultUser.userRoleId);
        expectedUser.setRole(defaultUserRole);
        const expectedResult = [null, expectedUser];
        userRespositoryMock.getByEmployeeNumber = jest.fn(() => clonedUser);
        userRoleRespositoryMock.get = jest.fn(() => defaultUserRole);

        // act
        let result = await getService().get(defaultUser.employeeNumber);

        // assert
        expect(result).toEqual(expectedResult);
        expect(userRespositoryMock.getByEmployeeNumber.mock.calls).toHaveLength(1);
        expect(userRespositoryMock.getByEmployeeNumber.mock.calls[0][0]).toBe(defaultUser.employeeNumber);
        expect(userRoleRespositoryMock.get.mock.calls).toHaveLength(1);
        expect(userRoleRespositoryMock.get.mock.calls[0][0]).toBe(defaultUser.userRoleId);
        expect(loggerMock.error.mock.calls).toHaveLength(0);
    });
});