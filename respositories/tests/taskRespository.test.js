const connectionMock = jest.createMockFromModule('../../database/connection');
const taskRespository = require('../taskRespository');

describe('list', () => {
   test('database connection fails', async () => {
      // arrange
      const expectedSqlQuery = 'SELECT * FROM `Task`';
      const expectedError = new Error('Error in database.');
      connectionMock.execute = jest.fn().mockRejectedValue(expectedError);

      // act & assert
      await expect(taskRespository(connectionMock).list()).rejects.toEqual(expectedError);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toBeUndefined();
   });

   test('returns valid content', async () => {
      // arrange
      const expectedData = [{ id: '1', code: '2312' }, { id: '2', code: '9922' }];
      const expectedSqlQuery = 'SELECT * FROM `Task`';
      connectionMock.execute = jest.fn(() => expectedData);
      
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
   test('database connection fails', async () => {
      // arrange
      const userId = 1
      const expectedSqlQuery = 'SELECT * FROM `Task` WHERE `UserId` = ?';
      const expectedParams = [userId];
      const expectedError = new Error('Error in database.');
      connectionMock.execute = jest.fn().mockRejectedValue(expectedError);

      // act & assert
      await expect(taskRespository(connectionMock).listByUserId(userId)).rejects.toEqual(expectedError);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('returns valid content', async () => {
      // arrange
      const userId = 1
      const expectedData = [{ id: '1', code: '2312' }];
      const expectedSqlQuery = 'SELECT * FROM `Task` WHERE `UserId` = ?';
      const expectedParams = [userId];
      connectionMock.execute = jest.fn(() => expectedData);
      
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
   ])('taskCode is invalid', async (taskCode) => {
      // arrange
      const expectError = new Error("taskCode cannot be empty.");
      connectionMock.execute = jest.fn(() => { });
      
      // act & assert
      await expect(taskRespository(connectionMock).get(taskCode)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test('database connection fails', async () => {
      // arrange
      const taskCode = 'pid-3355';
      const expectedSqlQuery = 'SELECT * FROM `Task` WHERE `Code` = ?';
      const expectedParams = [taskCode];
      const expectedError = new Error('Error in database.');
      connectionMock.execute = jest.fn().mockRejectedValue(expectedError);

      // act & assert
      await expect(taskRespository(connectionMock).get(taskCode)).rejects.toEqual(expectedError);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('returns valid content', async () => {
      // arrange
      const taskCode = 'pid-3355';
      const expectedData = [{ id: '1', code: '2312' }];
      const expectedSqlQuery = 'SELECT * FROM `Task` WHERE `Code` = ?';
      const expectedParams = [taskCode];
      connectionMock.execute = jest.fn(() => expectedData);
      
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
   ])('task object is invalid', async (task) => {
      // arrange
      const expectError = new Error("task object cannot be empty.");
      connectionMock.execute = jest.fn(() => { });
      
      // act & assert
      await expect(taskRespository(connectionMock).create(task)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test('database connection fails', async () => {
      // arrange
      const task = { code: '2312', summary: 'fake', hasSensitiveData: false, userId: '1234' };
      const expectedSqlQuery = 'INSERT INTO `Task` (`Code`, `Summary`, `HasSensitiveData`, `UserId`) VALUES (?, ?, ?, ?)';
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
      const task = { code: '2312', summary: 'fake', hasSensitiveData: false, userId: '1234' };
      const expectedSqlQuery = 'INSERT INTO `Task` (`Code`, `Summary`, `HasSensitiveData`, `UserId`) VALUES (?, ?, ?, ?)';
      const expectedParams = [task.code, task.summary, task.hasSensitiveData, task.userId];
      connectionMock.execute = jest.fn(() => []);

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
      const task = { code: '2312', summary: 'fake', hasSensitiveData: false, userId: '1234' };
      const expectedSqlQuery = 'INSERT INTO `Task` (`Code`, `Summary`, `HasSensitiveData`, `UserId`) VALUES (?, ?, ?, ?)';
      const expectedParams = [task.code, task.summary, task.hasSensitiveData, task.userId];
      connectionMock.execute = jest.fn(() => [task]);

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
   ])('taskCode is invalid', async (taskCode) => {
      // arrange
      const task = { code: '2312', summary: 'fake', hasSensitiveData: false, userId: '1234' };
      const expectError = new Error("task code cannot be empty.");
      connectionMock.execute = jest.fn(() => { });
      
      // act & assert
      await expect(taskRespository(connectionMock).update(taskCode, task)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test.each([
      null,
      undefined
   ])('task object is invalid', async (task) => {
      // arrange
      const taskCode = 'pid-1234'
      const expectError = new Error("task object cannot be empty.");
      connectionMock.execute = jest.fn(() => { });
      
      // act & assert
      await expect(taskRespository(connectionMock).update(taskCode, task)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test('database connection fails', async () => {
      // arrange
      const taskCode = 'pid-1344';
      const task = { summary: 'fake', hasSensitiveData: false };
      const expectedSqlQuery = 'UPDATE `Task` SET `Summary` = ?, `HasSensitiveData` = ? WHERE `Code` = ?';
      const expectedParams = [task.summary, task.hasSensitiveData, task.code];
      const expectedError = new Error('Error in database.');
      connectionMock.execute = jest.fn().mockRejectedValue(expectedError);

      // act & assert
      await expect(taskRespository(connectionMock).update(taskCode, task)).rejects.toEqual(expectedError);
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('task is not updated', async () => {
      // arrange
      const taskCode = 'pid-1344';
      const task = { summary: 'fake', hasSensitiveData: false };
      const expectedSqlQuery = 'UPDATE `Task` SET `Summary` = ?, `HasSensitiveData` = ? WHERE `Code` = ?';
      const expectedParams = [task.summary, task.hasSensitiveData, task.code];
      connectionMock.execute = jest.fn(() => []);

      // act
      let result = await taskRespository(connectionMock).update(taskCode, task);

      // act & assert
      expect(result).toBeFalsy();
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });

   test('task is updated', async () => {
      // arrange
      const taskCode = 'pid-1344';
      const task = { summary: 'fake', hasSensitiveData: false };
      const expectedSqlQuery = 'UPDATE `Task` SET `Summary` = ?, `HasSensitiveData` = ? WHERE `Code` = ?';
      const expectedParams = [task.summary, task.hasSensitiveData, task.code];
      connectionMock.execute = jest.fn(() => [task]);

      // act
      let result = await taskRespository(connectionMock).update(taskCode, task);

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
   ])('task code is invalid', async (taskCode) => {
      // arrange
      const expectError = new Error("taskCode cannot be empty.");
      connectionMock.execute = jest.fn(() => { });
      
      // act & assert
      await expect(taskRespository(connectionMock).remove(taskCode)).rejects.toEqual(expectError);
      expect(connectionMock.execute.mock.calls).toHaveLength(0);
   });

   test('database connection fails', async () => {
      // arrange
      const taskCode = 'pid-543'
      const expectedSqlQuery = 'DELET FROM `Task` WHERE `Code` = ?';
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
      const expectedSqlQuery = 'DELET FROM `Task` WHERE `Code` = ?';
      const expectedParams = [taskCode];
      connectionMock.execute = jest.fn(() => []);

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
      const task = { code: '2312', summary: 'fake', hasSensitiveData: false, userId: '1234' };
      const expectedSqlQuery = 'DELET FROM `Task` WHERE `Code` = ?';
      const expectedParams = [taskCode];
      connectionMock.execute = jest.fn(() => [task]);

      // act
      let result = await taskRespository(connectionMock).remove(taskCode);

      // act & assert
      expect(result).toBeTruthy();
      expect(connectionMock.execute.mock.calls).toHaveLength(1);
      expect(connectionMock.execute.mock.calls[0][0]).toBe(expectedSqlQuery);
      expect(connectionMock.execute.mock.calls[0][1]).toEqual(expectedParams);
   });
});