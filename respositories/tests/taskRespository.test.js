const connectionMock = jest.createMockFromModule('../../database/connection');
const taskRespository = require('../taskRespository');
const Task = require('../../models/task');

const taskTableCollumns = [
   'Code',
   'Summary', 
   'HasSensitiveData',
   'ClosedDate',
   'BIN_TO_UUID(UserId) AS UserId'
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
      let func = () => taskRespository(dbConnection);

      // act & assert
      expect(func).toThrow(expectError);
   })
});

describe('list', () => {
   test('database connection fails and throws error', async () => {
      // arrange
      const expectedSqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task`;
      const expectedError = new Error('Error in database.');
      connectionMock.execute = jest.fn().mockRejectedValue(expectedError);

      // act & assert
      await expect(taskRespository(connectionMock).list()).rejects.toEqual(expectedError);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toBeUndefined();
   });

   test('database does not return data and returns empty array', async () => {
      // arrange
      const expectedSqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task`;
      connectionMock.execute = jest.fn(() => []);
      
      // act
      let result = await taskRespository(connectionMock).list();

      // assert
      expect(result).toHaveLength(0);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toBeUndefined();
   });

   test('database returns data and returns tasks', async () => {
      // arrange
      const dbData = [
         { Id: '1', Code: '2312', Summary: 'oof', HasSensitiveData: 0, ClosedDate: null, UserId: '11edaf9f-f439-223e-8ec2-0242ac140002' },
         { Id: '3', Code: '5555', Summary: 'phew', HasSensitiveData: 1, ClosedDate: null, UserId: '11edaf9f-f439-545c-8ec2-0242ac140560' },
      ];
      const expectedData = Task.map(dbData);
      const expectedSqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task`;
      connectionMock.execute = jest.fn(() => dbData);
      
      // act
      let result = await taskRespository(connectionMock).list();

      // assert
      expect(result).toEqual(expectedData);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toBeUndefined();
   });
});

describe('list by user id', () => {
   test.each([
      null,
      undefined
   ])('userId is invalid and throws error', async (userId) => {
      // arrange
      const expectError = new Error('userId cannot be empty.');
      
      // act & assert
      await expect(taskRespository(connectionMock).listByUserId(userId)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test('database connection fails and throws error', async () => {
      // arrange
      const userId = 1
      const expectedSqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task WHERE UserId = UUID_TO_BIN(?)`;
      const expectedParams = [userId];
      const expectedError = new Error('Error in database.');
      connectionMock.execute = jest.fn().mockRejectedValue(expectedError);

      // act & assert
      await expect(taskRespository(connectionMock).listByUserId(userId)).rejects.toEqual(expectedError);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('database does not return data and returns empty array', async () => {
      // arrange
      const userId = '11edaf9f-f439-223e-8ec2-0242ac140002'
      const expectedSqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task WHERE UserId = UUID_TO_BIN(?)`;
      const expectedParams = [userId];
      connectionMock.execute = jest.fn(() => []);
      
      // act
      let result = await taskRespository(connectionMock).listByUserId(userId);

      // assert
      expect(result).toHaveLength(0);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('database returns data and returns tasks', async () => {
      // arrange
      const userId = '11edaf9f-f439-223e-8ec2-0242ac140002'
      const dbData = [
         { Id: '1', Code: '2312', Summary: 'oof', HasSensitiveData: 0, ClosedDate: null, UserId: userId },
         { Id: '3', Code: '5555', Summary: 'phew', HasSensitiveData: 1, ClosedDate: null, UserId: '11edaf9f-f439-545c-8ec2-0242ac140560' },
      ];
      const expectedData = Task.map(dbData);
      const expectedSqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task WHERE UserId = UUID_TO_BIN(?)`;
      const expectedParams = [userId];
      connectionMock.execute = jest.fn(() => dbData);
      
      // act
      let result = await taskRespository(connectionMock).listByUserId(userId);

      // assert
      expect(result).toEqual(expectedData);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });
});

describe('get', () => {
   test.each([
      null,
      undefined
   ])('taskCode is invalid and throws error', async (taskCode) => {
      // arrange
      const expectError = new Error('taskCode cannot be empty.');
      
      // act & assert
      await expect(taskRespository(connectionMock).get(taskCode)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test('database connection fails and throws error', async () => {
      // arrange
      const taskCode = 'pid-3355';
      const expectedSqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task WHERE Code = ?`;
      const expectedParams = [taskCode];
      const expectedError = new Error('Error in database.');
      connectionMock.execute = jest.fn().mockRejectedValue(expectedError);

      // act & assert
      await expect(taskRespository(connectionMock).get(taskCode)).rejects.toEqual(expectedError);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('databse does not return data and returns null', async () => {
      // arrange
      const taskCode = 'pid-3355';
      const expectedSqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task WHERE Code = ?`;
      const expectedParams = [taskCode];
      connectionMock.execute = jest.fn(() => []);
      
      // act
      let result = await taskRespository(connectionMock).get(taskCode);

      // assert
      expect(result).toBeNull();
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('databse returns data and returns task', async () => {
      // arrange
      const taskCode = 'pid-3355';
      const dbData = [{ Id: '1', Code: taskCode, Summary: 'oof', HasSensitiveData: 0, ClosedDate: null, UserId: '11edaf9f-f439-545c-8ec2-0242ac140560' }];
      const expectedData = Task.map(dbData)[0];
      const expectedSqlQuery = `SELECT ${taskTableCollumns.join(', ')} FROM Task WHERE Code = ?`;
      const expectedParams = [taskCode];
      connectionMock.execute = jest.fn(() => dbData);
      
      // act
      let result = await taskRespository(connectionMock).get(taskCode);

      // assert
      expect(result).toEqual(expectedData);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });
});

describe('create', () => {
   test.each([
      null,
      undefined
   ])('task object is invalid and throws error', async (task) => {
      // arrange
      const expectError = new Error('task object cannot be empty.');
      
      // act & assert
      await expect(taskRespository(connectionMock).create(task)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test('database connection fails and throws error', async () => {
      // arrange
      const task = new Task('2312', 'fake', 0, null, '11234');
      const expectedSqlQuery = 'INSERT INTO Task (Code, Summary, HasSensitiveData, UserId) VALUES (?, ?, ?, UUID_TO_BIN(?))';
      const expectedParams = [task.code, task.summary, task.hasSensitiveData, task.userId];
      const expectedError = new Error('Error in database.');
      connectionMock.execute = jest.fn().mockRejectedValue(expectedError);

      // act & assert
      await expect(taskRespository(connectionMock).create(task)).rejects.toEqual(expectedError);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('task is not saved', async () => {
      // arrange
      const task = new Task('2312', 'fake', 0, null, '11234');
      const dbResult = { affectedRows: 0 };
      const expectedSqlQuery = 'INSERT INTO Task (Code, Summary, HasSensitiveData, UserId) VALUES (?, ?, ?, UUID_TO_BIN(?))';
      const expectedParams = [task.code, task.summary, task.hasSensitiveData, task.userId];
      connectionMock.execute = jest.fn(() => dbResult);

      // act
      let result = await taskRespository(connectionMock).create(task);

      // act & assert
      expect(result).toBeFalsy();
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('task is saved', async () => {
      // arrange
      const task = new Task('2312', 'fake', 0, null, '11234');
      const dbResult = { affectedRows: 1 };
      const expectedSqlQuery = 'INSERT INTO Task (Code, Summary, HasSensitiveData, UserId) VALUES (?, ?, ?, UUID_TO_BIN(?))';
      const expectedParams = [task.code, task.summary, task.hasSensitiveData, task.userId];
      connectionMock.execute = jest.fn(() => dbResult);

      // act
      let result = await taskRespository(connectionMock).create(task);

      // act & assert
      expect(result).toBeTruthy();
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });
});

describe('update', () => {
   test.each([
      null,
      undefined
   ])('taskCode is invalid and throws error', async (taskCode) => {
      // arrange
      const task = new Task('2312', 'fake', 0, null, '11234');
      const expectError = new Error('task code cannot be empty.');
      
      // act & assert
      await expect(taskRespository(connectionMock).update(taskCode, task)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test.each([
      null,
      undefined
   ])('task object is invalid and throws error', async (task) => {
      // arrange
      const taskCode = 'pid-1234'
      const expectError = new Error('task object cannot be empty.');
      
      // act & assert
      await expect(taskRespository(connectionMock).update(taskCode, task)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test('database connection fails and throws error', async () => {
      // arrange
      const task = new Task('2312', 'fake', 0, null, '11234');
      const expectedSqlQuery = 'UPDATE Task SET Summary = ?, HasSensitiveData = ?, ClosedDate = ? WHERE Code = ?';
      const expectedParams = [task.summary, task.hasSensitiveData, task.closedDate, task.code];
      const expectedError = new Error('Error in database.');
      connectionMock.execute = jest.fn().mockRejectedValue(expectedError);

      // act & assert
      await expect(taskRespository(connectionMock).update(task.code, task)).rejects.toEqual(expectedError);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('task is not updated', async () => {
      // arrange
      const task = new Task('2312', 'fake', 0, null, '11234');
      const dbResult = { affectedRows: 0 };
      const expectedSqlQuery = 'UPDATE Task SET Summary = ?, HasSensitiveData = ?, ClosedDate = ? WHERE Code = ?';
      const expectedParams = [task.summary, task.hasSensitiveData, task.closedDate, task.code];
      connectionMock.execute = jest.fn(() => dbResult);

      // act
      let result = await taskRespository(connectionMock).update(task.code, task);

      // act & assert
      expect(result).toBeFalsy();
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('task is updated', async () => {
      // arrange
      const task = new Task('2312', 'fake', 0, null, '11234');
      const dbResult = { affectedRows: 1 };
      const expectedSqlQuery = 'UPDATE Task SET Summary = ?, HasSensitiveData = ?, ClosedDate = ? WHERE Code = ?';
      const expectedParams = [task.summary, task.hasSensitiveData, task.closedDate, task.code];
      connectionMock.execute = jest.fn(() => dbResult);

      // act
      let result = await taskRespository(connectionMock).update(task.code, task);

      // act & assert
      expect(result).toBeTruthy();
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });
});

describe('remove', () => {
   test.each([
      null,
      undefined
   ])('task code is invalid and throws error', async (taskCode) => {
      // arrange
      const expectError = new Error('taskCode cannot be empty.');
      
      // act & assert
      await expect(taskRespository(connectionMock).remove(taskCode)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test('database connection fails and throws error', async () => {
      // arrange
      const taskCode = 'pid-543'
      const expectedSqlQuery = 'DELETE FROM Task WHERE Code = ?';
      const expectedParams = [taskCode];
      const expectedError = new Error('Error in database.');
      connectionMock.execute = jest.fn().mockRejectedValue(expectedError);

      // act & assert
      await expect(taskRespository(connectionMock).remove(taskCode)).rejects.toEqual(expectedError);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('task is not removed', async () => {
      // arrange
      const taskCode = 'pid-543'
      const dbResult = { affectedRows: 0 };
      const expectedSqlQuery = 'DELETE FROM Task WHERE Code = ?';
      const expectedParams = [taskCode];
      connectionMock.execute = jest.fn(() => dbResult);

      // act
      let result = await taskRespository(connectionMock).remove(taskCode);

      // act & assert
      expect(result).toBeFalsy();
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('task is saved', async () => {
      // arrange
      const taskCode = 'pid-543'
      const dbResult = { affectedRows: 1 };
      const expectedSqlQuery = 'DELETE FROM Task WHERE Code = ?';
      const expectedParams = [taskCode];
      connectionMock.execute = jest.fn(() => dbResult);

      // act
      let result = await taskRespository(connectionMock).remove(taskCode);

      // act & assert
      expect(result).toBeTruthy();
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });
});