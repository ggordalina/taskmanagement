const connectionMock = jest.createMockFromModule('../../../database/connection');
const userRepository = require('../userRepository');
const User = require('../../models/user');

const userTableCollumns = [
   'BIN_TO_UUID(Id) AS Id',
   'EmployeeNumber', 
   'Name',
   'BIN_TO_UUID(UserRoleId) AS UserRoleId'
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
      let func = () => userRepository(dbConnection);

      // act & assert
      expect(func).toThrow(expectError);
   })
});

describe('getByEmployeeNumber', () => {
    test.each([
        null,
        undefined
     ])('employeeNumber is invalid and throws error', async (employeeNumber) => {
        // arrange
        const expectError = new Error("employeeNumber cannot be empty.");
        
        // act & assert
        await expect(userRepository(connectionMock).getByEmployeeNumber(employeeNumber)).rejects.toEqual(expectError);
        expect(connectionMock.execute.mock.calls).toHaveLength(0);
     });
  
     test('database connection fails and throws error', async () => {
         // arrange
         const employeeNumber = '542245';
         const expectedSqlQuery = `SELECT ${userTableCollumns.join(', ')} FROM User WHERE EmployeeNumber = ?`;
         const expectedParams = [employeeNumber];
         const expectedError = new Error('Error in database.');
         connectionMock.execute = jest.fn().mockRejectedValue(expectedError);
   
         // act & assert
         await expect(userRepository(connectionMock).getByEmployeeNumber(employeeNumber)).rejects.toEqual(expectedError);
         expect(connectionMock.execute.mock.calls).toHaveLength(1);
         expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
         expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
      });

      test('database does not return data and returns null', async () => {
         // arrange
         const employeeNumber = '542245';
         const expectedSqlQuery = `SELECT ${userTableCollumns.join(', ')} FROM User WHERE EmployeeNumber = ?`;
         const expectedParams = [employeeNumber];
         connectionMock.execute = jest.fn(() => []);
         
         // act
         let result = await userRepository(connectionMock).getByEmployeeNumber(employeeNumber);
   
         // assert
         expect(result).toBeNull();
         expect(connectionMock.execute.mock.calls).toHaveLength(1);
         expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
         expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
      });
  
      test('database returns data returns user', async () => {
         // arrange
         const employeeNumber = '542245';
         const dbData = [{ Id: '1', EmployeeNumber: '5201', Name: 'Joe', UserRoleId: '1234' }];
         const expectedData = User.map(dbData)[0];
         const expectedSqlQuery = `SELECT ${userTableCollumns.join(', ')} FROM User WHERE EmployeeNumber = ?`;
         const expectedParams = [employeeNumber];
         connectionMock.execute = jest.fn(() => dbData);
         
         // act
         let result = await userRepository(connectionMock).getByEmployeeNumber(employeeNumber);
   
         // assert
         expect(result).toEqual(expectedData);
         expect(connectionMock.execute.mock.calls).toHaveLength(1);
         expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
         expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
      });
});