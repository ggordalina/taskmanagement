const connectionMock = jest.createMockFromModule('../../database/connection');
const userRoleRepository = require('../userRoleRepository');
const UserRole = require('../../models/userRole');

const userRoleTableCollumns = [
   'BIN_TO_UUID(Id) AS Id',
   'Description'
];

beforeEach(() => {
   connectionMock.execute = jest.fn(() => { });
});

describe('parameters', () => {
   test.each([
      null,
      undefined
   ])('dbConnection is invalid and throws error', (dbConnection) => {
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
     ])('userRoleId is invalid and throws error', async (userRoleId) => {
        // arrange
        const expectError = new Error('id cannot be empty.');
        
        // act & assert
        await expect(userRoleRepository(connectionMock).get(userRoleId)).rejects.toEqual(expectError);
        expect(connectionMock.execute.mock.calls).toHaveLength(0);
     });
  
     test('database connection fails and throws error', async () => {
        // arrange
        const userRoleId = '542245';
        const expectedSqlQuery = `SELECT ${userRoleTableCollumns} FROM UserRole WHERE Id = ?`;
        const expectedParams = [userRoleId];
        const expectedError = new Error('Error in database.');
        connectionMock.execute = jest.fn().mockRejectedValue(expectedError);
  
        // act & assert
        await expect(userRoleRepository(connectionMock).get(userRoleId)).rejects.toEqual(expectedError);
        expect(connectionMock.execute.mock.calls).toHaveLength(1);
        expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
        expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
     });
  
      test('database does not return data returns null', async () => {
         // arrange
         const userRoleId = '542245';
         const expectedSqlQuery = `SELECT ${userRoleTableCollumns} FROM UserRole WHERE Id = ?`;
         const expectedParams = [userRoleId];
         connectionMock.execute = jest.fn(() => []);
         
         // act
         let result = await userRoleRepository(connectionMock).get(userRoleId);
   
         // assert
         expect(result).toBeNull();
         expect(connectionMock.execute.mock.calls).toHaveLength(1);
         expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
         expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
      });

      test('database return datas returns user role', async () => {
         // arrange
         const userRoleId = '542245';
         const dbData = [{ Id: '1', Description: 'Manager' }];
         const expectedData = UserRole.map(dbData)[0];
         const expectedSqlQuery = `SELECT ${userRoleTableCollumns} FROM UserRole WHERE Id = ?`;
         const expectedParams = [userRoleId];
         connectionMock.execute = jest.fn(() => dbData);
         
         // act
         let result = await userRoleRepository(connectionMock).get(userRoleId);
   
         // assert
         expect(result).toEqual(expectedData);
         expect(connectionMock.execute.mock.calls).toHaveLength(1);
         expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
         expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
      });
});