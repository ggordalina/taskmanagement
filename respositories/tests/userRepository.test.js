const connectionMock = jest.createMockFromModule('../../database/connection');
const userRepository = require('../userRepository');

describe('parameters', () => {
   test.each([
      null,
      undefined
   ])('dbConnection is invalid', (dbConnection) => {
      // arrange
      const expectError = new Error('dbConnection cannot be empty.');
      
      // act
      let func = () => userRepository(dbConnection);

      // act & assert
      expect(func).toThrow(expectError);
   })
});

describe('getByEmployeeNumber', () => {
    test.each([
        null,
        undefined
     ])('employeeNumber is invalid', async (employeeNumber) => {
        // arrange
        const expectError = new Error("employeeNumber cannot be empty.");
        connectionMock.execute = jest.fn(() => { });
        
        // act & assert
        await expect(userRepository(connectionMock).getByEmployeeNumber(employeeNumber)).rejects.toEqual(expectError);
        expect(connectionMock.execute.mock.calls).toHaveLength(0);
     });
  
     test('database connection fails', async () => {
        // arrange
        const employeeNumber = '542245';
        const expectedSqlQuery = 'SELECT * FROM `User` WHERE `EmployeeNumber` = ?';
        const expectedParams = [employeeNumber];
        const expectedError = new Error('Error in database.');
        connectionMock.execute = jest.fn().mockRejectedValue(expectedError);
  
        // act & assert
        await expect(userRepository(connectionMock).getByEmployeeNumber(employeeNumber)).rejects.toEqual(expectedError);
        expect(connectionMock.execute.mock.calls).toHaveLength(1);
        expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
        expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
     });
  
     test('returns valid content', async () => {
        // arrange
        const employeeNumber = '542245';
        const expectedData = [{ id: '1', code: '2312' }];
        const expectedSqlQuery = 'SELECT * FROM `User` WHERE `EmployeeNumber` = ?';
        const expectedParams = [employeeNumber];
        connectionMock.execute = jest.fn(() => expectedData);
        
        // act
        let result = await userRepository(connectionMock).getByEmployeeNumber(employeeNumber);
  
        // assert
        expect(result).toEqual(expectedData);
        expect(connectionMock.execute.mock.calls).toHaveLength(1);
        expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
        expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
     });
});