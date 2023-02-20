const { getFormatedResponseBody, mapApplicationErrorToHttpStatusCode } = require('../utils/httpUtils');
const broker = require('../notification-centre/broker')();
const Task = require('../models/task');

const tasksApi = (taskService) => {
    if (!taskService) {
        throw new Error('task service cannot be empty.');
    }

    const list = async (request, response) => {
        try {
            const [error, tasks] = await taskService.list(request.currentUser);
            if (error) {
                response
                    .status(mapApplicationErrorToHttpStatusCode(error.exception))
                    .send(getFormatedResponseBody(error.content, null));
                return;
            }

            response.status(200).send(getFormatedResponseBody(null, tasks));
        } catch (error) {
            response.status(500).send(getFormatedResponseBody(error, null));
        }
    };

    const get = async (request, response) => {
        try {
            const taskCode = request.params.code;
            const [error, task] = await taskService.get(request.currentUser, taskCode);
            if (error) {
                response
                    .status(mapApplicationErrorToHttpStatusCode(error.exception))
                    .send(getFormatedResponseBody(error.content, null));
                return;
            }

            response.status(200).send(getFormatedResponseBody(null, task));
        } catch (error) {
            response.status(500).send(getFormatedResponseBody(error, null));
        }
    };

    const post = async (request, response) => {
        try {
            const requestBody = request?.body;
            if (!requestBody) {
                response.status(400).send(getFormatedResponseBody('request body cannot be empty', null));
                return;
            }

            const [bodyValidationError, isValid] = Task.validate(requestBody);
            if (!isValid) {
                response.status(400).send(getFormatedResponseBody(bodyValidationError, null));
                return;
            }

            const taskToCreate = new Task(
                requestBody.code,
                requestBody.summary,
                requestBody.hasSensitiveData
            );

            const [error, createdTask] = await taskService.create(request.currentUser, taskToCreate);
            if (error) {
                response
                    .status(mapApplicationErrorToHttpStatusCode(error.exception))
                    .send(getFormatedResponseBody(error.content, null));
                return;
            }

            response.status(201).send(getFormatedResponseBody(null, createdTask));
        } catch (error) {
            response.status(500).send(getFormatedResponseBody(error, null));
        }
    };

    const patch = async(request, response) => {
        try {
            const requestBody = request?.body;
            if (!requestBody) {
                response.status(400).send(getFormatedResponseBody('request body cannot be empty', null));
                return;
            }

            const [bodyValidationError, isValid] = Task.patchValidate(requestBody);
            if (!isValid) {
                response.status(400).send(getFormatedResponseBody(bodyValidationError, null));
                return;
            }
            
            const taskCode = request.params.code;
            const [error] = await taskService.update(request.currentUser, taskCode, requestBody);
            if (error) {
                response
                    .status(mapApplicationErrorToHttpStatusCode(error.exception))
                    .send(getFormatedResponseBody(error.content, null));
                return;
            }

            response.status(204).send();
        } catch (error) {
            response.status(500).send(getFormatedResponseBody(error, null));
        }
    };

    const patchCloseDate = async (request, response) => {
        try {
            const taskCode = request.params.code;
            const currentUser = request.currentUser;
            const closingDate = new Date();

            const [error] = await taskService.update(currentUser, taskCode, { closedDate: closingDate });
            if (error) {
                response
                    .status(mapApplicationErrorToHttpStatusCode(error.exception))
                    .send(getFormatedResponseBody(error.content, null));
                return;
            }

            broker.publish('task_op', `Task ${taskCode} has been closed by ${currentUser.name} on ${closingDate.toUTCString()}`);
            response.status(204).send();
        } catch (error) {
            response.status(500).send(getFormatedResponseBody(error, null));
        }
    };

    const remove = async (request, response) => {
        try {
            const taskCode = request.params.code;
            const [error] = await taskService.remove(request.currentUser, taskCode); 
            if (error) {
                response
                    .status(mapApplicationErrorToHttpStatusCode(error.exception))
                    .send(getFormatedResponseBody(error.content, null));
                return;
            }
            
            response.status(204).send();
        } catch (error) {
            response.status(500).send(getFormatedResponseBody(error, null));
        }
    };

    return { list, get, post, patch, patchCloseDate, remove }
};

module.exports = tasksApi;