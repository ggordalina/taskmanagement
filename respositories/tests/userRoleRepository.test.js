const connectionMock = jest.createMockFromModule('../../database/connection');
const userRoleRepository = require('../userRoleRepository');

describe('parameters', () => {
   test.each([
      null,
      undefined
   ])('dbConnection is invalid', (dbConnection) => {
      // arrange
      const expectError = new Error('dbConnection cannot be empty.');
      
      // act
      let func = () => userRoleRepository(dbConnection);

      // act & assert
      expect(func).toThrow(expectError);
   })
});

describe('get', () => {
    test.each([
        null,
        undefined
     ])('userRoleId is invalid', async (userRoleId) => {
        // arrange
        const expectError = new Error("userRoleId cannot be empty.");
        connectionMock.execute = jest.fn(() => { });
        
        // act & assert
        await expect(userRoleRepository(connectionMock).get(userRoleId)).rejects.toEqual(expectError);
        expect(connectionMock.execute.mock.calls).toHaveLength(0);
     });
  
     test('database connection fails', async () => {
        // arrange
        const userRoleId = '542245';
        const expectedSqlQuery = 'SELECT * FROM `UserRole` WHERE `Id` = ?';
        const expectedParams = [userRoleId];
        const expectedError = new Error('Error in database.');
        connectionMock.execute = jest.fn().mockRejectedValue(expectedError);
  
        // act & assert
        await expect(userRoleRepository(connectionMock).get(userRoleId)).rejects.toEqual(expectedError);
        expect(connectionMock.execute.mock.calls).toHaveLength(1);
        expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
        expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
     });
  
     test('returns valid content', async () => {
        // arrange
        const userRoleId = '542245';
        const expectedData = [{ id: '1', description: 'manager' }];
        const expectedSqlQuery = 'SELECT * FROM `UserRole` WHERE `Id` = ?';
        const expectedParams = [userRoleId];
        connectionMock.execute = jest.fn(() => expectedData);
        
        // act
        let result = await userRoleRepository(connectionMock).get(userRoleId);
  
        // assert
        expect(result).toEqual(expectedData);
        expect(connectionMock.execute.mock.calls).toHaveLength(1);
        expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
        expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
     });
});